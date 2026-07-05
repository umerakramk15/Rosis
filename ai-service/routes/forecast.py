from flask import Blueprint, request, jsonify
import joblib
import numpy as np
import os
from datetime import datetime, timedelta

forecast_bp = Blueprint("forecast", __name__)

# Load model + encoder
_dir = os.path.dirname(__file__)
model_path = os.path.join(_dir, "../models/forecast_model.pkl")
encoder_path = os.path.join(_dir, "../models/forecast_label_encoder.pkl")

try:
    forecast_model = joblib.load(model_path)
    forecast_encoder = joblib.load(encoder_path)
    print("✅ Forecast model loaded")
except Exception as e:
    forecast_model = None
    forecast_encoder = None
    print(f"⚠️  Forecast model not found: {e}. Run training/train_forecast.py first.")

@forecast_bp.route("/forecast", methods=["POST"])
def forecast():
    try:
        if forecast_model is None:
            return jsonify({"error": "Forecast model not trained yet"}), 500

        data = request.get_json()
        product_id = data.get("product_id", "unknown")
        days_ahead = data.get("days_ahead", 7)
        
        # IMPORTANT: Use actual product data, not defaults
        category = data.get("category", "shirts")
        price = data.get("price", 1500)  # Now gets real price from request
        
        # If price is 0 or invalid, use a reasonable default
        if price <= 0:
            price = 1500

        # Encode category
        known_classes = list(forecast_encoder.classes_)
        if category not in known_classes:
            category = known_classes[0] if known_classes else "shirts"
        category_encoded = forecast_encoder.transform([category])[0]

        predictions = []
        today = datetime.today()

        for i in range(1, days_ahead + 1):
            future_date = today + timedelta(days=i)
            day_of_week = future_date.weekday()
            month = future_date.month

            features = np.array([[day_of_week, month, price, category_encoded]])
            predicted_units = max(0, int(forecast_model.predict(features)[0]))

            predictions.append({
                "date": future_date.strftime("%Y-%m-%d"),
                "predicted_units": predicted_units
            })

        return jsonify(predictions), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@forecast_bp.route("/force-forecast", methods=["POST"])
def force_forecast():
    """Force regenerate forecast for a product (bypass cache)"""
    try:
        if forecast_model is None:
            return jsonify({"error": "Forecast model not trained"}), 500

        data = request.get_json()
        product_id = data.get("product_id")
        days_ahead = data.get("days_ahead", 7)
        category = data.get("category", "shirts")
        price = data.get("price", 1500)
        force = data.get("force", True)

        # Encode category
        known_classes = list(forecast_encoder.classes_)
        if category not in known_classes:
            category = known_classes[0]
        category_encoded = forecast_encoder.transform([category])[0]

        predictions = []
        today = datetime.today()

        for i in range(1, days_ahead + 1):
            future_date = today + timedelta(days=i)
            day_of_week = future_date.weekday()
            month = future_date.month

            features = np.array([[day_of_week, month, price, category_encoded]])
            predicted_units = max(0, int(forecast_model.predict(features)[0]))

            predictions.append({
                "date": future_date.strftime("%Y-%m-%d"),
                "predicted_units": predicted_units
            })

        return jsonify({
            "product_id": product_id,
            "generated_at": datetime.now().isoformat(),
            "days": days_ahead,
            "forecast": predictions
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@forecast_bp.route("/batch-forecast", methods=["POST"])
def batch_forecast():
    """Generate forecasts for multiple products at once"""
    try:
        if forecast_model is None:
            return jsonify({"error": "Forecast model not trained"}), 500

        data = request.get_json()
        products = data.get("products", [])
        days_ahead = data.get("days_ahead", 7)

        results = []
        today = datetime.today()

        for product in products:
            category = product.get("category", "shirts")
            price = product.get("price", 1500)
            
            known_classes = list(forecast_encoder.classes_)
            if category not in known_classes:
                category = known_classes[0]
            category_encoded = forecast_encoder.transform([category])[0]

            predictions = []
            for i in range(1, days_ahead + 1):
                future_date = today + timedelta(days=i)
                features = np.array([[future_date.weekday(), future_date.month, price, category_encoded]])
                predicted_units = max(0, int(forecast_model.predict(features)[0]))
                predictions.append({
                    "date": future_date.strftime("%Y-%m-%d"),
                    "predicted_units": predicted_units
                })

            results.append({
                "product_id": product.get("product_id"),
                "forecast": predictions
            })

        return jsonify({
            "generated_at": datetime.now().isoformat(),
            "results": results
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500