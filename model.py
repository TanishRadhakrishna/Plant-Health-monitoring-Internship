import xgboost as xgb
from tensorflow.keras.applications import EfficientNetB0

def load_cnn():
    model = EfficientNetB0(
        weights="imagenet",
        include_top=False,
        pooling="avg"
    )
    return model

def train_xgboost(X, y):
    model = xgb.XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        objective="multi:softprob",
        num_class=4
    )
    model.fit(X, y)
    return model
