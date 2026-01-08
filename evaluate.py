import os
import cv2
import numpy as np
import joblib
from sklearn.metrics import classification_report
from feature_engineering import extract_features
from tensorflow.keras.models import load_model

PROCESSED_DIR = "data/processed"
VAL_FILE = "data/splits/val.txt"

LABEL_MAP = {
    "Healthy": 0,
    "Pest": 1,
    "Nutrient_Deficiency": 2,
    "Water_Stress": 3
}

cnn = load_model("saved_models/efficientnet.h5")
xgb = joblib.load("saved_models/xgboost.pkl")

X, y_true = [], []

for line in open(VAL_FILE):
    cls, img_name = line.strip().split("/")
    img_path = os.path.join(PROCESSED_DIR, cls, img_name)

    img = cv2.imread(img_path)
    img = cv2.resize(img, (224, 224)) / 255.0

    cnn_feat = cnn.predict(np.expand_dims(img, 0))
    eng_feat = np.array(extract_features(img)).reshape(1, -1)

    X.append(np.concatenate([cnn_feat, eng_feat], axis=1)[0])
    y_true.append(LABEL_MAP[cls])

X = np.array(X)
y_pred = xgb.predict(X)

print(classification_report(y_true, y_pred))
