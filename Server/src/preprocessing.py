from datasets import load_dataset
import datasets
from huggingface_hub import hf_hub_download
from PIL import Image
import torch
import requests
import os

class Preprocessing():
    def __init__(self):
        pass

    def load_dataset(self,split):
        os.environ["HF_HUB_DOWNLOAD_TIMEOUT"] = "10500"
        dataset = load_dataset("lmms-lab/COCO-Caption", split=split, cache_dir="D:/Java Projects/Findr/Server/datasets")
        ds = dataset.filter(lambda x: x['image'] is not None and x['question_id'] is not None and len(x['answer']) > 0)
        return ds

    def image_caption_pairs(self,ds):
        import random
        for data in ds:
            img:Image.Image=data['image'].convert('RGB')
            cap=random.choice(data['answer']).strip()
            print(img,cap)
            yield img,cap    

if __name__=="__main__":
    obj=Preprocessing()
    obj.load_dataset('val')