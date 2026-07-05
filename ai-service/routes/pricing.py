from flask import Blueprint, request, jsonify
from groq import Groq
import os
import json

pricing_bp = Blueprint("pricing", __name__)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@pricing_bp.route("/pricing", methods=["POST"])
def pricing():
    try:
        data = request.get_json()
        product_id = data.get("product_id", "unknown")
        current_price = data.get("current_price", 0)
        competitor_price = data.get("competitor_price", 0)
        stock = data.get("stock", 0)

        prompt = f"""
You are a pricing strategy AI for an e-commerce platform in Pakistan (prices in Rs.).

Product data:
- Current Price: Rs. {current_price}
- Competitor Price: Rs. {competitor_price}
- Stock Level: {stock} units

Suggest an optimal price. Return ONLY valid JSON, no markdown:
{{
  "suggested_price": number,
  "reasoning": "one sentence explanation"
}}
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200
        )

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
