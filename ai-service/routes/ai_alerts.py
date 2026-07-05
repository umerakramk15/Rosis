from flask import Blueprint, request, jsonify
from groq import Groq
import os
import json
from datetime import datetime, timedelta

ai_alerts_bp = Blueprint("ai_alerts", __name__)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@ai_alerts_bp.route("/generate-alerts", methods=["POST"])
def generate_alerts():
    """Generate AI-powered alerts for merchant dashboard"""
    try:
        data = request.get_json()
        
        low_stock = data.get("low_stock", [])
        return_risks = data.get("return_risks", [])
        sales_trend = data.get("sales_trend", {})
        abandoned_carts = data.get("abandoned_carts", 0)
        
        prompt = f"""You are an AI business analyst for an e-commerce merchant in Pakistan.

Current store data:
- Low stock products (name, stock left): {json.dumps(low_stock)}
- High return risk products: {json.dumps(return_risks)}
- Revenue this month: Rs. {sales_trend.get('revenue', 0)}
- Orders this month: {sales_trend.get('orders', 0)}
- Abandoned carts: {abandoned_carts}

Generate EXACTLY 3 personalized alerts for this merchant. Each alert must have:
- id: number (1,2,3)
- type: "opportunity" or "warning" or "insight"
- urgency: "high" or "medium" or "low"
- title: short, actionable title (max 40 chars)
- body: specific explanation with numbers (max 120 chars)
- action: what merchant should do (e.g., "Reorder now", "Review listing", "Boost campaign")
- icon: choose one emoji (📈, ⚠️, ✨, 📦, 🔁, 💰, 🛒)

Return ONLY valid JSON array, no markdown, no explanation.
Example:
[{{"id":1,"type":"warning","urgency":"high","title":"Low Stock Alert","body":"Champagne Tote: only 7 units left","action":"Reorder now","icon":"⚠️"}}]"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
            temperature=0.7
        )
        
        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        alerts = json.loads(raw)
        
        return jsonify({"success": True, "alerts": alerts}), 200
        
    except Exception as e:
        print(f"AI Alerts error: {e}")
        # Return fallback alerts
        return jsonify({
            "success": True,
            "alerts": [
                {"id": 1, "type": "insight", "urgency": "low", "title": "AI Assistant Ready", "body": "Your store is connected to AI insights", "action": "Explore", "icon": "✨"}
            ]
        }), 200


@ai_alerts_bp.route("/analyze-trend", methods=["POST"])
def analyze_trend():
    """Analyze revenue trend with AI insights"""
    try:
        data = request.get_json()
        monthly_revenue = data.get("monthly_revenue", [])
        current_revenue = data.get("current_revenue", 0)
        previous_revenue = data.get("previous_revenue", 0)
        
        percent_change = ((current_revenue - previous_revenue) / previous_revenue * 100) if previous_revenue > 0 else 0
        
        prompt = f"""Analyze this e-commerce revenue data:
Monthly revenue (last 12 months in Rs. thousands): {monthly_revenue}
Current month revenue: Rs. {current_revenue}
Previous month revenue: Rs. {previous_revenue}
Percent change: {percent_change:.1f}%

Return JSON only:
{{
  "trend": "up" or "down" or "stable",
  "percent_change": {percent_change:.1f},
  "insight": "one sentence explaining the trend (max 80 chars)",
  "recommendation": "one actionable suggestion (max 80 chars)"
}}"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )
        
        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)
        
        return jsonify({"success": True, "data": result}), 200
        
    except Exception as e:
        print(f"Trend analysis error: {e}")
        return jsonify({
            "success": True,
            "data": {
                "trend": "stable",
                "percent_change": 0,
                "insight": "Data analysis temporarily unavailable",
                "recommendation": "Check back later for AI insights"
            }
        }), 200


@ai_alerts_bp.route("/channel-insights", methods=["POST"])
def channel_insights():
    """Generate insights about channel performance"""
    try:
        data = request.get_json()
        web_pct = data.get("web_percentage", 60)
        app_pct = data.get("app_percentage", 25)
        social_pct = data.get("social_percentage", 15)
        
        prompt = f"""Channel mix data:
- Web: {web_pct}%
- App: {app_pct}%
- Social: {social_pct}%

Return JSON:
{{
  "best_channel": "web/app/social",
  "insight": "one sentence insight about channel performance",
  "recommendation": "what to do to improve"
}}"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200
        )
        
        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)
        
        return jsonify({"success": True, "data": result}), 200
        
    except Exception as e:
        print(f"Channel insights error: {e}")
        return jsonify({"success": True, "data": {"best_channel": "web", "insight": "Your web channel is performing best", "recommendation": "Focus marketing on web"}}), 200