const axios = require("axios");

const FLASK_URL = process.env.FLASK_AI_URL || "http://localhost:5001";

// ── Axios instance for Flask ──────────────────────────────────────────
const flaskAPI = axios.create({
  baseURL: FLASK_URL,
  timeout: 30000, // 30s — AI calls can be slow
  headers: { "Content-Type": "application/json" },
});

// ── Mock responses — used when Flask is not ready ─────────────────────
const MOCKS = {
  visualSearch: ["shirt", "blue", "cotton", "casual", "men"],
  llmSearch: {
    category: "shirts",
    color: "blue",
    max_price: 2000,
    material: "cotton",
    occasion: "casual",
  },
  returnRisk: {
    level: "low",
    probability: 0.12,
    topReason: "Good ratings and accurate description",
    lastCalculated: new Date(),
  },
  forecast: [
    { date: new Date(), predicted_units: 15 },
    { date: new Date(Date.now() + 86400000), predicted_units: 18 },
    { date: new Date(Date.now() + 172800000), predicted_units: 12 },
  ],
  pricing: {
    suggested_price: 1350,
    reasoning:
      "Competitor is 10% cheaper and stock is high. A small reduction will boost sales.",
  },
  coaching: [
    "Your top selling category is shirts — consider adding more variety.",
    "Weekend sales spike detected — run promotions on Fridays.",
    "Low stock on 3 products — reorder soon to avoid stockout.",
    "Return rate is within healthy range. Keep maintaining product quality.",
  ],
  compliance: {
    passed: [
      "Accurate product descriptions",
      "Valid return policy listed",
      "Correct category labels",
    ],
    violations: [],
    summary: "No compliance violations found. All checks passed.",
  },
};
// ── Helper: call Flask or return mock if Flask is down ───────────────
const callFlask = async (endpoint, data, mockKey) => {
  try {
    const response = await flaskAPI.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.warn(`⚠️  Flask ${endpoint} unavailable — using mock data`);
    return MOCKS[mockKey];
  }
};
// ── Visual Search ─────────────────────────────────────────────────────
// Sends base64 image to Flask → gets back 5 keywords
const visualSearch = async (imageBase64) => {
  return callFlask("/visual-search", { image: imageBase64 }, "visualSearch");
};
// ── LLM Smart Search ──────────────────────────────────────────────────
// Sends natural language query → gets back structured filters
const llmSearch = async (query) => {
  return callFlask("/llm-search", { query }, "llmSearch");
};
// ── Return Risk Prediction ────────────────────────────────────────────
// Sends product data → gets back risk level + probability + reason
const predictReturnRisk = async (product) => {
  return callFlask(
    "/predict-return",
    {
      category: product.category,
      avg_rating: product.ratings?.average || 0,
      price: product.price,
      num_reviews: product.ratings?.count || 0,
    },
    "returnRisk",
  );
};

// ── Demand Forecasting ────────────────────────────────────────────────
// Sends product_id + days_ahead → gets back [{date, predicted_units}]
const getForecast = async (productId, daysAhead = 7) => {
  return callFlask(
    "/forecast",
    { product_id: productId, days_ahead: daysAhead },
    "forecast",
  );
};

// ── Dynamic Pricing ───────────────────────────────────────────────────
// Sends current price, competitor price, stock → gets suggested_price + reasoning
const getPricingSuggestion = async (product, competitorPrice) => {
  return callFlask(
    "/pricing",
    {
      product_id: product._id,
      current_price: product.price,
      competitor_price: competitorPrice,
      stock: product.stock,
    },
    "pricing",
  );
};

// ── Merchant Coaching ─────────────────────────────────────────────────
// Sends KPI data → gets back array of LLM insight strings
const getCoachingInsights = async (kpis) => {
  return callFlask("/coaching", { kpis }, "coaching");
};

// ── Compliance Check ──────────────────────────────────────────────────
// Sends merchant product data → gets passed/violated checks
const getComplianceReport = async (merchantData) => {
  return callFlask("/compliance", { merchant: merchantData }, "compliance");
};
// Generate AI-powered alerts for merchant dashboard
const generateAIAlerts = async (
  lowStock,
  returnRisks,
  salesTrend,
  abandonedCarts = 0,
) => {
  try {
    const response = await flaskAPI.post("/generate-alerts", {
      low_stock: lowStock,
      return_risks: returnRisks,
      sales_trend: salesTrend,
      abandoned_carts: abandonedCarts,
    });
    return response.data.alerts || [];
  } catch (error) {
    console.warn("⚠️ AI alerts unavailable:", error.message);
    return [];
  }
};

// Analyze revenue trend with AI
const analyzeRevenueTrend = async (
  monthlyRevenue,
  currentRevenue,
  previousRevenue,
) => {
  try {
    const response = await flaskAPI.post("/analyze-trend", {
      monthly_revenue: monthlyRevenue,
      current_revenue: currentRevenue,
      previous_revenue: previousRevenue,
    });
    return response.data.data;
  } catch (error) {
    console.warn("⚠️ Trend analysis unavailable:", error.message);
    return {
      trend: "stable",
      percent_change: 0,
      insight: "Trend analysis temporarily unavailable",
      recommendation: "Check back later",
    };
  }
};

// Generate channel performance insights
const getChannelInsights = async (webPct, appPct, socialPct) => {
  try {
    const response = await flaskAPI.post("/channel-insights", {
      web_percentage: webPct,
      app_percentage: appPct,
      social_percentage: socialPct,
    });
    return response.data.data;
  } catch (error) {
    console.warn("⚠️ Channel insights unavailable:", error.message);
    return {
      best_channel: "web",
      insight: "Your web channel is performing best",
      recommendation: "Continue optimizing your website experience",
    };
  }
};

const forceForecast = async (productId, category, price, daysAhead = 7) => {
  try {
    const response = await flaskAPI.post("/force-forecast", {
      product_id: productId,
      category: category,
      price: price,
      days_ahead: daysAhead,
      force: true,
    });
    return response.data;
  } catch (error) {
    console.warn(`⚠️ Force forecast failed for ${productId}:`, error.message);
    return null;
  }
};

// Batch forecast for multiple products
const batchForecast = async (products, daysAhead = 7) => {
  try {
    const response = await flaskAPI.post("/batch-forecast", {
      products: products.map((p) => ({
        product_id: p._id,
        category: p.category,
        price: p.price,
      })),
      days_ahead: daysAhead,
    });
    return response.data;
  } catch (error) {
    console.warn("⚠️ Batch forecast failed:", error.message);
    return null;
  }
};
const generateCompliancePDF = async (reportData) => {
  try {
    const response = await flaskAPI.post('/generate-compliance-pdf', reportData, {
      responseType: 'arraybuffer'
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.warn('⚠️ PDF generation failed:', error.message);
    throw new Error('PDF generation failed');
  }
};

module.exports = {
  visualSearch,
  llmSearch,
  predictReturnRisk,
  getForecast,
  getPricingSuggestion,
  getCoachingInsights,
  getComplianceReport,
  generateAIAlerts,
  analyzeRevenueTrend,
  getChannelInsights,
  forceForecast,
  batchForecast,
  generateCompliancePDF,
};
