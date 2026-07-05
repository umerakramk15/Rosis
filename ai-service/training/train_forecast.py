import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error
import joblib
import os

# Load data
data_path = os.path.join(os.path.dirname(__file__), "../data/sales_data.csv")
df = pd.read_csv(data_path)

print(f"Loaded {len(df)} sales records")

# Encode category
le = LabelEncoder()
df["category_encoded"] = le.fit_transform(df["category"])

# Features: day_of_week, month, price, category_encoded
X = df[["day_of_week", "month", "price", "category_encoded"]]
y = df["units_sold"]

# Train model
model = LinearRegression()
model.fit(X, y)

# Evaluate
preds = model.predict(X)
mae = mean_absolute_error(y, preds)
print(f"✅ Forecast model trained | MAE: {mae:.2f} units")

# Save model + encoder
models_dir = os.path.join(os.path.dirname(__file__), "../models")
os.makedirs(models_dir, exist_ok=True)

joblib.dump(model, os.path.join(models_dir, "forecast_model.pkl"))
joblib.dump(le, os.path.join(models_dir, "forecast_label_encoder.pkl"))
print("✅ Saved: models/forecast_model.pkl")
print("✅ Saved: models/forecast_label_encoder.pkl")
