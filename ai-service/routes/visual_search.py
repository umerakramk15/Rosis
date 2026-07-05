from flask import Blueprint, request, jsonify
from groq import Groq
import os
import json
import base64

visual_search_bp = Blueprint("visual_search", __name__)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@visual_search_bp.route("/visual-search", methods=["POST"])
def visual_search():
    try:
        data = request.get_json()
        image_base64 = data.get("image", "")

        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        },
                        {
                            "type": "text",
                            "text": "Look at this product image. Return ONLY a JSON array of exactly 5 search keywords that best describe this product for e-commerce search. Example: [\"blue\", \"shirt\", \"cotton\", \"formal\", \"men\"]. No explanation, no markdown."
                        }
                    ]
                }
            ],
            max_tokens=100
        )

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        keywords = json.loads(raw)

        return jsonify(keywords), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
