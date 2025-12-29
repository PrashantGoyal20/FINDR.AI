import os,random,math
import torch
import torch.nn as nn
from torchvision import transforms
from tqdm import tqdm
import open_clip
from datasets import load_dataset
from PIL import Image
from src.preprocessing import Preprocessing
from torch.utils.data import DataLoader,Dataset
import warnings
import base64
from io import BytesIO
warnings.filterwarnings("ignore", message=".*QuickGELU mismatch.*")

device='cuda' if torch.cuda.is_available() else 'cpu'
torch.cuda.empty_cache()
model, _, preprocess =open_clip.create_model_and_transforms('ViT-B-32',pretrained='openai',device=device )
SAVE_DIR='model/clip/best.pt'
tokenizer=open_clip.get_tokenizer('ViT-B-32')

def seed_everything(seed=42):
    random.seed(seed); torch.manual_seed(seed); torch.cuda.manual_seed_all(seed)

class clip_dataset(torch.utils.data.Dataset):

    def __init__(self,split='val',processor=None,tokenizer=None):
        preprocessor=Preprocessing()
        self.ds=preprocessor.load_dataset(split=split)
        self.tokenizer=tokenizer
        self.processor=processor

    def __len__(self):
        return len(self.ds)    
    
    def __getitem__(self,index):
        data=self.ds[index]
        img:Image.Image=data['image'].convert('RGB')
        text=random.choice(data['answer']).strip()
        image=self.processor(img) if self.processor else img
        token_text=self.tokenizer([text])[0]
        return image,token_text
    
def clip_loss(image_features, text_features, temperature):
    image_features = image_features / image_features.norm(dim=-1, keepdim=True)
    text_features  = text_features  / text_features.norm(dim=-1, keepdim=True)
    logits_per_image = (image_features @ text_features.t()) * torch.exp(temperature)
    logits_per_text  = logits_per_image.t()
    targets = torch.arange(image_features.size(0), device=image_features.device)
    loss_i = nn.CrossEntropyLoss()(logits_per_image, targets)
    loss_t = nn.CrossEntropyLoss()(logits_per_text, targets)
    return (loss_i + loss_t) / 2    

def collate(batch):
        imgs, toks = zip(*batch)
        imgs = torch.stack(imgs, 0)
        toks = torch.stack(toks, 0)
        return imgs, toks            

def train(arch='ViT-B-32',pretrained='openai',batchSize=2,epochs=5,lr=5e-5,warmup_steps=200,grad_accum=1,output_dir='model/clip'):
    seed_everything(42)
    torch.cuda.empty_cache()
    os.makedirs(output_dir,exist_ok=True)
    
    tokenizer=open_clip.get_tokenizer(arch)

    train_ds=clip_dataset(split='val',processor=preprocess,tokenizer=tokenizer)
    val_ds=clip_dataset(split='test',processor=preprocess,tokenizer=tokenizer)

    train_dl = DataLoader(train_ds, batch_size=batchSize, shuffle=True, num_workers=4, collate_fn=collate, pin_memory=True)
    val_dl   = DataLoader(val_ds,   batch_size=batchSize, shuffle=False, num_workers=4, collate_fn=collate, pin_memory=True)

    total_steps = epochs * math.ceil(len(train_dl) / grad_accum)
    def lr_lambda(step):
        if step < warmup_steps:
            return (step + 1) / max(1, warmup_steps)
        progress = (step - warmup_steps) / max(1, total_steps - warmup_steps)
        return 0.5 * (1 + math.cos(math.pi * progress))
    

    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=0.01)
    scheduler = torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda)

    scaler = torch.cuda.amp.GradScaler(enabled=(device.startswith("cuda")))
    best_val = float("inf")

    for epoch in range(1,epochs+1):
        model.train()
        running = 0.0
        step = 0
        pbar = tqdm(train_dl, desc=f"Epoch {epoch}/{epochs}")
        optimizer.zero_grad(set_to_none=True)
        for images, tokens in pbar:
            images = images.to(device, non_blocking=True)
            tokens = tokens.to(device, non_blocking=True)

            with torch.cuda.amp.autocast(enabled=(device.startswith("cuda"))):
                image_features = model.encode_image(images)
                text_features  = model.encode_text(tokens)
                loss = clip_loss(image_features, text_features, model.logit_scale)

            scaler.scale(loss / grad_accum).backward()
            step += 1
            running += loss.item()
            if step % grad_accum == 0:
                scaler.step(optimizer); scaler.update()
                optimizer.zero_grad(set_to_none=True)
                scheduler.step()

            pbar.set_postfix(loss=running / step, lr=optimizer.param_groups[0]["lr"])


    model.eval()
    with torch.no_grad():
            val_losses = []
            for images, tokens in tqdm(val_dl, leave=False, desc="Val"):
                images = images.to(device); tokens = tokens.to(device)
                with torch.cuda.amp.autocast(enabled=(device.startswith("cuda"))):
                    image_features = model.encode_image(images)
                    text_features  = model.encode_text(tokens)
                    val_loss = clip_loss(image_features, text_features, model.logit_scale)
                val_losses.append(val_loss.item())
            val_mean = sum(val_losses)/len(val_losses)

    ckpt_path = os.path.join(output_dir, f"epoch{epoch}_val{val_mean:.4f}.pt")
    torch.save({"model": model.state_dict()}, ckpt_path)
    if val_mean < best_val:
        best_val = val_mean
        torch.save({"model": model.state_dict()}, os.path.join(output_dir, "best.pt"))

    print(f"Epoch {epoch} done. TrainLoss ~{running/step:.4f}  ValLoss {val_mean:.4f}")        

class FeedbackDataset(Dataset):
    def __init__(self, examples, processor=None):
        self.examples = examples
        self.processor = processor

    def __len__(self):
        return len(self.examples)

    def __getitem__(self, idx):
        ex = self.examples[idx]
        image = ex["image"]
        if not isinstance(image, Image.Image):
            image = Image.open(image).convert("RGB")
        return image, ex["text"], ex["label"]
    
def feedback(model,processor,device,data,epochs=5,batch_size=4,lr=1e-6):
    dataset=FeedbackDataset(data,processor=processor)
    dataLoader=DataLoader(dataset,batch_size=batch_size,shuffle=True)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr)
    loss_fn = nn.CosineEmbeddingLoss()
    model.load_state_dict(torch.load(SAVE_DIR, map_location=device))
    model.train()
    for epoch in range(epochs):
        total_loss = 0
        for images, texts, labels in dataLoader:
            inputs = processor(text=texts, images=images,
                               return_tensors="pt", padding=True).to(device)
            text_embeds = model.get_text_features(inputs["input_ids"], inputs["attention_mask"])
            image_embeds = model.get_image_features(inputs["pixel_values"])
            text_embeds = text_embeds / text_embeds.norm(dim=-1, keepdim=True)
            image_embeds = image_embeds / image_embeds.norm(dim=-1, keepdim=True)

            labels = torch.tensor(labels, dtype=torch.float, device=device)
            loss = loss_fn(image_embeds, text_embeds, labels)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
        
        print(f"{epoch+1}/{epochs} , Loss :{total_loss/len(dataLoader):.4f}")



def encode_img_and_text(imgs,text):
    image_feat=[]
    model, _, preprocess =open_clip.create_model_and_transforms('ViT-B-32',pretrained='openai',device=device,quick_gelu=True )
    checkpoint = torch.load(SAVE_DIR, map_location=device)
    model.to(device)
    for img in imgs:
        if hasattr(img, 'read'):
            image = Image.open(img.stream).convert("RGB")
        else:
            if isinstance(img, dict) and 'preview' in img:
                img_data = img['preview'].split(",")[1]
                image = Image.open(BytesIO(base64.b64decode(img_data))).convert("RGB")
            else:
                raise ValueError("Unsupported image input")
        image_input = preprocess(image).unsqueeze(0).to(device)
        with torch.no_grad():
            image_features = model.encode_image(image_input)
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            image_feat.append(image_features)
    image_embedding=torch.stack(image_feat).mean(dim=0)
    text_tokens=tokenizer([text]).to(device)
    with torch.no_grad():
        text_features = model.encode_text(text_tokens)
        text_features = text_features / text_features.norm(dim=-1, keepdim=True) 
    alpha=0.7
    combined=alpha*image_embedding+(1-alpha)*text_features
    combined=combined/combined.norm(dim=-1,keepdim=True)
    return combined.squeeze(0).cpu().tolist()    

