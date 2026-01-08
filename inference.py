import cv2
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from feature_engineering import extract_features

cnn = load_model("saved_models/efficientnet.h5")
xgb = joblib.load("saved_models/xgboost.pkl")

LABELS = ["Healthy", "Pest", "Nutrient Deficiency", "Water Stress"]

def predict(image_path):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (224, 224)) / 255.0

    cnn_feat = cnn.predict(np.expand_dims(img, 0))
    eng_feat = np.array(extract_features(img)).reshape(1, -1)

    features = np.concatenate([cnn_feat, eng_feat], axis=1)

    pred = xgb.predict(features)[0]
    conf = max(xgb.predict_proba(features)[0])

    return LABELS[pred], round(conf * 100, 2)
