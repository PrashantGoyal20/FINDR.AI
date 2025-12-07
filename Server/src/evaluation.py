import os,json
from training import clip_dataset
import torch
from torch.utils.data import DataLoader
import open_clip
from datasets import load_dataset
from tqdm import tqdm
import numpy as np

import warnings
warnings.filterwarnings("ignore", message=".*QuickGELU mismatch.*")

def collate(batch):
    img,text=zip(*batch)
    return torch.stack(img,0),torch.stack(text,0)

@torch.no_grad
def encode_img(model,processor,tokenizer,split,device):
    ds=clip_dataset(split=split,processor=processor,tokenizer=tokenizer)
    print('dataset Loaded')
    dl=DataLoader(ds,batch_size=4,shuffle=False,num_workers=4,collate_fn=collate)
    all_img,all_text=[],[]
    for img,text in tqdm(dl,desc=f"Encode {split}"):
        img=img.to(device)
        text=text.to(device)
        img_f=model.encode_image(img)
        text_f=model.encode_text(text)
        img_f=img_f/img_f.norm(keepdim=True,dim=-1)
        text_f=text_f/text_f.norm(keepdim=True,dim=-1)
        all_img.append(img_f.cpu())
        all_text.append(text_f.cpu())
    return torch.cat(all_img),torch.cat(all_text)


def gold_k(sims,k):
    ranks = (-sims).argsort(axis=1)
    hits = (ranks[:, :k] == np.arange(sims.shape[0])[:,None]).any(axis=1)
    return hits.mean()


def main(path='./model/clip/best.pt',arch='ViT-B-32', pretrained='openai'):
    device="cuda" if torch.cuda.is_available() else "cpu"
    torch.cuda.empty_cache()
    model, _, preprocess =open_clip.create_model_and_transforms(arch,pretrained=pretrained,device=device,quick_gelu=True )
    tokenizer=open_clip.get_tokenizer(arch)
    state=torch.load(path,map_location='cuda')['model']
    model.load_state_dict(state, strict=False)
    model.eval()
    print('model loaded')
    img_f,text_f=encode_img(model,processor=preprocess,tokenizer=tokenizer,split='test',device=device)
    sim=(img_f@text_f.T).numpy()
    g1=gold_k(sim,1)
    g5=gold_k(sim,5)
    g10=gold_k(sim,10)
    print(f"Image->Text  R@1={g1:.3f}  R@5={g5:.3f}  R@10={g10:.3f}")

if __name__=="__main__":
    main()    

