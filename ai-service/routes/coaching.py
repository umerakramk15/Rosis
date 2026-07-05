from flask import Blueprint, request, jsonify
from groq import Groq
import os
import json

coaching_bp = Blueprint("coaching", __name__)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@coaching_bp.route("/coaching", methods=["POST"])
def coaching():
    try:
        data = request.get_json()
        kpis = data.get("kpis", {})

        revenue = kpis.get("revenue", 0)
        total_orders = kpis.get("totalOrders", 0)
        return_rate = kpis.get("returnRate", 0)
        top_product = kpis.get("topProduct", "N/A")

        prompt = f"""
You are a business coach AI for an e-commerce merchant in Pakistan.

Merchant KPIs:
- Total Revenue: Rs. {revenue}
- Total Orders: {total_orders}
- Return Rate: {return_rate * 100:.1f}%
- Top Selling Product: {top_product}

Give exactly 3 short, actionable business insights as a JSON array of strings.
Return ONLY valid JSON array, no markdown, no explanation.
Example: ["Insight 1", "Insight 2", "Insight 3"]
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        insights = json.loads(raw)

        return jsonify(insights), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
