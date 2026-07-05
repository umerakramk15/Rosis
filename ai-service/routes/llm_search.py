from flask import Blueprint, request, jsonify
from groq import Groq
import os
import json

llm_search_bp = Blueprint("llm_search", __name__)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
@llm_search_bp.route("/llm-search", methods=["POST"])
def llm_search():
    try:
        data = request.get_json()
        query = data.get("query", "")

        prompt = f"""
You are a product search filter extractor for an e-commerce store.
Extract search filters from this query: "{query}"

Return ONLY valid JSON, no explanation, no markdown:
{{
  "category": null or string (e.g. "shirts", "shoes", "electronics"),
  "color": null or string,
  "max_price": null or number,
  "material": null or string,
  "occasion": null or string (e.g. "formal", "casual", "sports")
}}
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200
        )

        raw = response.choices[0].message.content.strip()
        # Strip markdown if present
        raw = raw.replace("```json", "").replace("```", "").strip()
        filters = json.loads(raw)

        return jsonify(filters), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
