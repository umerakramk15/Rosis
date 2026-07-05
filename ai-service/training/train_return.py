import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# Load data
data_path = os.path.join(os.path.dirname(__file__), "../data/return_data.csv")
df = pd.read_csv(data_path)

print(f"Loaded {len(df)} return records")

# Encode category
le = LabelEncoder()
df["category_encoded"] = le.fit_transform(df["category"])

# Features
X = df[["category_encoded", "avg_rating", "price", "num_reviews"]]
y = df["return_level"]

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# Evaluate
preds = model.predict(X)
acc = accuracy_score(y, preds)
print(f"✅ Return model trained | Accuracy: {acc * 100:.1f}%")
print("\nClassification Report:")
print(classification_report(y, preds, target_names=["low", "medium", "high"]))

# Save model + encoder
models_dir = os.path.join(os.path.dirname(__file__), "../models")
os.makedirs(models_dir, exist_ok=True)

joblib.dump(model, os.path.join(models_dir, "return_model.pkl"))
joblib.dump(le, os.path.join(models_dir, "return_label_encoder.pkl"))
print("✅ Saved: models/return_model.pkl")
print("✅ Saved: models/return_label_encoder.pkl")
