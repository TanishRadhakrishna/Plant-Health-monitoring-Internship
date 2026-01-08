import os
import cv2
import numpy as np
import joblib
from model import load_cnn, train_xgboost
from feature_engineering import extract_features

PROCESSED_DIR = "data/processed"
TRAIN_FILE = "data/splits/train.txt"

LABEL_MAP = {
    "Healthy": 0,
    "Pest": 1,
    "Nutrient_Deficiency": 2,
    "Water_Stress": 3
}

images, labels, engineered = [], [], []

for line in open(TRAIN_FILE):
    cls, img_name = line.strip().split("/")
    img_path = os.path.join(PROCESSED_DIR, cls, img_name)

    img = cv2.imread(img_path)
    if img is None:
        continue

    img = cv2.resize(img, (224, 224)) / 255.0

    images.append(img)
    labels.append(LABEL_MAP[cls])
    engineered.append(extract_features(img))

images = np.array(images)
engineered = np.array(engineered)
labels = np.array(labels)

cnn = load_cnn()
cnn_features = cnn.predict(images, batch_size=16)

final_features = np.concatenate([cnn_features, engineered], axis=1)

xgb_model = train_xgboost(final_features, labels)

os.makedirs("saved_models", exist_ok=True)
cnn.save("saved_models/efficientnet.h5")
joblib.dump(xgb_model, "saved_models/xgboost.pkl")
