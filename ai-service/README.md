# Flask AI Service — Setup Guide

## 1. Install dependencies $env:GROQ_API_KEY="your_key_here"
```bash
pip install -r requirements.txt
```

## 2. Set your Groq API key
Create a `.env` file (copy from `.env.example`):
```
GROQ_API_KEY=your_key_here
```
Get your key free from: https://console.groq.com

Then load it before running:
```bash
# Windows
set GROQ_API_KEY=your_key_here

# Mac/Linux
export GROQ_API_KEY=your_key_here
```

## 3. Generate training data + train models
```bash
python training/generate_data.py
python training/train_forecast.py
python training/train_return.py
```

## 4. Run the Flask server
```bash
python app.py
```
Server runs on: http://localhost:5001

## 5. Update backend .env
```
FLASK_AI_URL=http://localhost:5001
```

---

## Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Health check |
| POST | /llm-search | Extract filters from natural language |
| POST | /visual-search | Identify product from image |
| POST | /forecast | Predict demand for next N days |
| POST | /predict-return | Predict return risk level |
| POST | /pricing | Suggest optimal price |
| POST | /coaching | Generate merchant insights |
| POST | /compliance | Audit product descriptions |
