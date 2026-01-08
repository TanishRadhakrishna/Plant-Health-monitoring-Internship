import os
import cv2
import random
from tqdm import tqdm

IMG_SIZE = 224

RAW_DIR = "data/raw"
PROCESSED_DIR = "data/processed"
SPLITS_DIR = "data/splits"

os.makedirs(PROCESSED_DIR, exist_ok=True)
os.makedirs(SPLITS_DIR, exist_ok=True)

def preprocess_images():
    for cls in os.listdir(RAW_DIR):
        raw_cls = os.path.join(RAW_DIR, cls)
        proc_cls = os.path.join(PROCESSED_DIR, cls)
        os.makedirs(proc_cls, exist_ok=True)

        for img_name in tqdm(os.listdir(raw_cls), desc=f"Processing {cls}"):
            img_path = os.path.join(raw_cls, img_name)
            img = cv2.imread(img_path)

            if img is None:
                continue

            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            img = img / 255.0
            save_path = os.path.join(proc_cls, img_name)
            cv2.imwrite(save_path, (img * 255).astype("uint8"))

def create_splits(train_ratio=0.7, val_ratio=0.15):
    train_f = open(os.path.join(SPLITS_DIR, "train.txt"), "w")
    val_f = open(os.path.join(SPLITS_DIR, "val.txt"), "w")
    test_f = open(os.path.join(SPLITS_DIR, "test.txt"), "w")

    for cls in os.listdir(PROCESSED_DIR):
        images = os.listdir(os.path.join(PROCESSED_DIR, cls))
        random.shuffle(images)

        n = len(images)
        train_end = int(n * train_ratio)
        val_end = int(n * (train_ratio + val_ratio))

        for i, img in enumerate(images):
            line = f"{cls}/{img}\n"
            if i < train_end:
                train_f.write(line)
            elif i < val_end:
                val_f.write(line)
            else:
                test_f.write(line)

    train_f.close()
    val_f.close()
    test_f.close()

if __name__ == "__main__":
    preprocess_images()
    create_splits()
