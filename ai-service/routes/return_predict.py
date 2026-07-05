from flask import Blueprint, request, jsonify
import joblib
import numpy as np
import os

return_predict_bp = Blueprint("return_predict", __name__)

# Load model + encoder
_dir = os.path.dirname(__file__)
model_path = os.path.join(_dir, "../models/return_model.pkl")
encoder_path = os.path.join(_dir, "../models/return_label_encoder.pkl")

try:
    return_model = joblib.load(model_path)
    return_encoder = joblib.load(encoder_path)
    print("✅ Return model loaded")
except Exception as e:
    return_model = None
    return_encoder = None
    print(f"⚠️  Return model not found: {e}. Run training/train_return.py first.")

LEVEL_MAP = {0: "low", 1: "medium", 2: "high"}
REASON_MAP = {
    "low": "Good ratings and reasonable price",
    "medium": "Moderate risk based on category and price",
    "high": "Low ratings or high price increases return likelihood"
}

@return_predict_bp.route("/predict-return", methods=["POST"])
def predict_return():
    try:
        if return_model is None:
            return jsonify({"error": "Return model not trained yet. Run train_return.py"}), 500

        data = request.get_json()
        category = data.get("category", "shirts")
        avg_rating = float(data.get("avg_rating", 4.0))
        price = float(data.get("price", 1500))
        num_reviews = int(data.get("num_reviews", 10))

        # Encode category (handle unseen)
        known_classes = list(return_encoder.classes_)
        if category not in known_classes:
            category = known_classes[0]
        category_encoded = return_encoder.transform([category])[0]

        features = np.array([[category_encoded, avg_rating, price, num_reviews]])

        level_idx = int(return_model.predict(features)[0])
        probabilities = return_model.predict_proba(features)[0]
        probability = round(float(probabilities[level_idx]), 2)

        level = LEVEL_MAP[level_idx]
        top_reason = REASON_MAP[level]

        return jsonify({
            "level": level,
            "probability": probability,
            "topReason": top_reason
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
