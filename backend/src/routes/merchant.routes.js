const router = require("express").Router();
const ctrl = require("../controllers/merchantController");
const { verifyJWT, requireMerchant } = require("../middleware/auth.middleware");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate.middleware");

// All merchant routes require login + merchant role
router.use(verifyJWT, requireMerchant);

// ── Inventory Forecast ────────────────────────────────────────────────
router.get("/forecast", ctrl.getAllForecasts); // GET /api/merchant/forecast
router.get("/forecast/:productId", ctrl.getForecast); // GET /api/merchant/forecast/:id

// ── Dynamic Pricing ───────────────────────────────────────────────────
router.get("/pricing/:productId", ctrl.getPricingSuggestion); // GET /api/merchant/pricing/:id

router.post(
  "/pricing/:productId/approve", // POST /api/merchant/pricing/:id/approve
  [
    body("suggestedPrice")
      .isFloat({ min: 1 })
      .withMessage("Valid price is required"),
    validate,
  ],
  ctrl.approvePricing,
);

// ── Return Risk ───────────────────────────────────────────────────────
router.get("/returns", ctrl.getReturnRisks); // GET /api/merchant/returns

// ── Coaching ──────────────────────────────────────────────────────────
router.get("/coaching", ctrl.getCoachingInsights); // GET /api/merchant/coaching

// ── Compliance ────────────────────────────────────────────────────────
router.get("/compliance", ctrl.getComplianceReport); // GET /api/merchant/compliance

router.get("/alerts", ctrl.getAIAlerts); // GET /api/merchant/alerts
router.get("/trend-analysis", ctrl.getTrendAnalysis); // GET /api/merchant/trend-analysis
router.get("/channel-insights", ctrl.getChannelInsights); // GET /api/merchant/channel-insights
router.get("/analytics", ctrl.getAnalytics);

// ── Forecast Refresh Routes ───────────────────────────────────────────
router.post("/forecast/:productId/refresh", ctrl.refreshForecast); // POST /api/merchant/forecast/:id/refresh
router.post("/forecast/refresh-all", ctrl.refreshAllForecasts); // POST /api/merchant/forecast/refresh-all

router.patch("/compliance/:violationId/resolve", ctrl.resolveViolation);
router.get("/compliance/export", ctrl.exportComplianceReport);

router.get("/compliance/export", ctrl.exportComplianceReport); // GET /api/merchant/compliance/export?format=pdf
router.get("/compliance/violation/:violationId", ctrl.getViolationDetails); // GET /api/merchant/compliance/violation/:id

module.exports = router;
