from flask import Flask
from routes.llm_search import llm_search_bp
from routes.visual_search import visual_search_bp
from routes.forecast import forecast_bp
from routes.return_predict import return_predict_bp
from routes.pricing import pricing_bp
from routes.coaching import coaching_bp
from routes.compliance import compliance_bp
from routes.ai_alerts import ai_alerts_bp  # NEW

app = Flask(__name__)

# Register all blueprints
app.register_blueprint(llm_search_bp)
app.register_blueprint(visual_search_bp)
app.register_blueprint(forecast_bp)
app.register_blueprint(return_predict_bp)
app.register_blueprint(pricing_bp)
app.register_blueprint(coaching_bp)
app.register_blueprint(compliance_bp)
app.register_blueprint(ai_alerts_bp)  # NEW

@app.route("/health", methods=["GET"])
def health():
    return {"status": "Flask AI Service running"}, 200

if __name__ == "__main__":
    app.run(port=5001, debug=True)