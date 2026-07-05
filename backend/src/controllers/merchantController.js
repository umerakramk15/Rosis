const Product = require("../models/Product");
const CompetitorPrices = require("../models/CompetitorPrices");
const AuditLog = require("../models/AuditLog");
const CoachingHistory = require("../models/CoachingHistory");
const SalesHistory = require("../models/SalesHistory");
const Order = require("../models/Order");
const asyncWrapper = require("../utils/asyncWrapper");
const { sendSuccess, sendError } = require("../utils/responseHelper");
const aiService = require("../services/aiService");
const pricingService = require("../services/pricingService");

// ── INVENTORY FORECAST ────────────────────────────────────────────────
exports.getForecast = asyncWrapper(async (req, res) => {
  const { productId } = req.params;
  const { days = 7 } = req.query;

  const product = await Product.findOne({
    _id: productId,
    merchantId: req.user._id,
  });
  if (!product) return sendError(res, 404, "Product not found.");

  // Use cached forecast if less than 24h old
  if (
    product.forecastData &&
    product.forecastUpdatedAt &&
    Date.now() - product.forecastUpdatedAt.getTime() < 24 * 60 * 60 * 1000
  ) {
    return sendSuccess(res, 200, "Forecast fetched (cached)", {
      product: { id: product._id, name: product.name, stock: product.stock },
      forecast: product.forecastData,
      cached: true,
    });
  }

  // Call Flask for fresh forecast
  const forecast = await aiService.getForecast(productId, parseInt(days));

  // Cache result in product document
  await Product.findByIdAndUpdate(productId, {
    forecastData: forecast,
    forecastUpdatedAt: new Date(),
  });

  sendSuccess(res, 200, "Forecast fetched", {
    product: { id: product._id, name: product.name, stock: product.stock },
    forecast,
    cached: false,
  });
});

// ── GET ALL FORECASTS for merchant (for chart page) ───────────────────
// ── GET ALL FORECASTS with full product details ───────────────────────
exports.getAllForecasts = asyncWrapper(async (req, res) => {
  const products = await Product.find({
    merchantId: req.user._id,
    isActive: true,
  }).select(
    "_id name price stock category images forecastData forecastUpdatedAt",
  );

  const results = products.map((p) => ({
    productId: p._id,
    name: p.name,
    price: p.price, // ← ADDED: actual price
    category: p.category, // ← ADDED: actual category
    currentStock: p.stock,
    image: p.images?.[0]?.url || null, // ← ADDED: product image
    forecast: Array.isArray(p.forecastData) ? p.forecastData : [],
    lastUpdated: p.forecastUpdatedAt,
    needsReorder: Array.isArray(p.forecastData)
      ? p.forecastData.reduce((sum, d) => sum + (d.predicted_units || 0), 0) >
        p.stock
      : false,
  }));

  sendSuccess(res, 200, "All forecasts fetched", results);
});

// ── DYNAMIC PRICING ───────────────────────────────────────────────────
exports.getPricingSuggestion = asyncWrapper(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findOne({
    _id: productId,
    merchantId: req.user._id,
  });
  if (!product) return sendError(res, 404, "Product not found.");

  // Get latest competitor price
  const competitor = await CompetitorPrices.findOne({ productId }).sort({
    fetchedAt: -1,
  });

  const competitorPrice = competitor?.competitorPrice || product.price;

  // Run rule engine first
  const ruleResult = pricingService.applyRules(product, competitorPrice);

  // Then call Flask/Groq for reasoning
  const aiResult = await aiService.getPricingSuggestion(
    product,
    competitorPrice,
  );

  sendSuccess(res, 200, "Pricing suggestion fetched", {
    productId: product._id,
    name: product.name,
    currentPrice: product.price,
    competitorPrice,
    suggestedPrice: ruleResult.suggestedPrice || aiResult.suggested_price,
    reasoning: aiResult.reasoning,
    ruleApplied: ruleResult.rule,
  });
});

// ── APPROVE PRICING SUGGESTION ────────────────────────────────────────
exports.approvePricing = asyncWrapper(async (req, res) => {
  const { productId } = req.params;
  const { suggestedPrice } = req.body;

  if (!suggestedPrice || suggestedPrice <= 0) {
    return sendError(res, 400, "Valid suggested price is required.");
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, merchantId: req.user._id },
    { price: suggestedPrice, suggestedPrice: null, pricingReasoning: null },
    { new: true },
  );

  if (!product) return sendError(res, 404, "Product not found.");

  // Log to audit
  await AuditLog.create({
    merchantId: req.user._id,
    actionType: "price_changed",
    relatedRule: "Dynamic pricing approval",
    isViolation: false,
    summary: `Price updated from ${product.price} to ${suggestedPrice}`,
    resourceId: product._id,
  });

  sendSuccess(res, 200, "Price updated successfully", product);
});

// ── RETURN RISK (all products) ────────────────────────────────────────
exports.getReturnRisks = asyncWrapper(async (req, res) => {
  const products = await Product.find({
    merchantId: req.user._id,
    isActive: true,
  }).select("name price category ratings returnRisk stock");

  const sorted = products.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.returnRisk?.level] - order[b.returnRisk?.level];
  });

  sendSuccess(res, 200, "Return risks fetched", sorted);
});

// ── MERCHANT COACHING ─────────────────────────────────────────────────
exports.getCoachingInsights = asyncWrapper(async (req, res) => {
  // Build KPI snapshot for this merchant
  const [revenueData, totalOrders, cancelledOrders, topProduct] =
    await Promise.all([
      Order.aggregate([
        { $match: { "items.merchantId": req.user._id, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments({ "items.merchantId": req.user._id }),
      Order.countDocuments({
        "items.merchantId": req.user._id,
        orderStatus: "cancelled",
      }),
      SalesHistory.aggregate([
        { $match: { merchantId: req.user._id } },
        { $group: { _id: "$productId", totalUnits: { $sum: "$unitsSold" } } },
        { $sort: { totalUnits: -1 } },
        { $limit: 1 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
      ]),
    ]);

  const kpis = {
    revenue: revenueData[0]?.total || 0,
    totalOrders,
    returnRate: totalOrders > 0 ? cancelledOrders / totalOrders : 0,
    topProduct: topProduct[0]?.product?.name || "N/A",
  };

  // Call Flask/Groq for insights
  const insights = await aiService.getCoachingInsights(kpis);

  // Save to history
  await CoachingHistory.create({
    merchantId: req.user._id,
    kpis,
    insights: Array.isArray(insights) ? insights : [insights],
  });

  sendSuccess(res, 200, "Coaching insights fetched", { kpis, insights });
});

// ── COMPLIANCE ASSISTANT ──────────────────────────────────────────────
exports.getComplianceReport = asyncWrapper(async (req, res) => {
  // Gather merchant data for compliance check
  const [products, auditLogs] = await Promise.all([
    Product.find({ merchantId: req.user._id, isActive: true }).select(
      "name description category price",
    ),
    AuditLog.find({ merchantId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20),
  ]);

  const merchantData = {
    products: products.map((p) => ({
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
    })),
    recentActions: auditLogs.map((l) => ({
      action: l.actionType,
      rule: l.relatedRule,
      isViolation: l.isViolation,
    })),
  };

  const report = await aiService.getComplianceReport(merchantData);

  // Save violations to audit log
  if (report.violations && report.violations.length > 0) {
    for (const violation of report.violations) {
      await AuditLog.create({
        merchantId: req.user._id,
        actionType: "product_updated",
        relatedRule: violation,
        isViolation: true,
        violationDetails: violation,
        summary: report.summary,
      });
    }
  }

  sendSuccess(res, 200, "Compliance report generated", {
    ...report,
    auditLogs,
  });
});

// Add to existing merchantController.js

// ── AI-POWERED ALERTS (NEW) ──────────────────────────────────────────
exports.getAIAlerts = asyncWrapper(async (req, res) => {
  const merchantId = req.user._id;

  // Collect real data for AI
  const [lowStockProducts, returnRiskProducts, salesData, abandonedCarts] =
    await Promise.all([
      Product.find({ merchantId, isActive: true, stock: { $lt: 20 } })
        .select("name stock")
        .limit(5),
      Product.find({ merchantId, isActive: true, "returnRisk.level": "high" })
        .select("name")
        .limit(5),
      Order.aggregate([
        { $match: { "items.merchantId": merchantId, paymentStatus: "paid" } },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.countDocuments({
        "items.merchantId": merchantId,
        paymentStatus: "pending",
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

  const lowStock = lowStockProducts.map((p) => ({
    name: p.name,
    stock: p.stock,
  }));
  const returnRisks = returnRiskProducts.map((p) => p.name);
  const salesTrend = {
    revenue: salesData[0]?.revenue || 0,
    orders: salesData[0]?.orders || 0,
  };

  // Call AI service for alerts
  const alerts = await aiService.generateAIAlerts(
    lowStock,
    returnRisks,
    salesTrend,
    abandonedCarts,
  );

  sendSuccess(res, 200, "AI alerts generated", alerts);
});

// ── AI-POWERED TREND ANALYSIS (NEW) ───────────────────────────────────
exports.getTrendAnalysis = asyncWrapper(async (req, res) => {
  const merchantId = req.user._id;
  const { period = "30d" } = req.query;

  // Calculate current and previous period revenue
  const now = new Date();
  const currentStart = new Date();
  currentStart.setDate(now.getDate() - 30);

  const previousStart = new Date(currentStart);
  previousStart.setDate(previousStart.getDate() - 30);

  const [currentRevenue, previousRevenue, monthlyData] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          "items.merchantId": merchantId,
          paymentStatus: "paid",
          createdAt: { $gte: currentStart },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      {
        $match: {
          "items.merchantId": merchantId,
          paymentStatus: "paid",
          createdAt: { $gte: previousStart, $lt: currentStart },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      { $match: { "items.merchantId": merchantId, paymentStatus: "paid" } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$total" } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const monthlyRevenueArray = new Array(12).fill(0);
  monthlyData.forEach((m) => {
    monthlyRevenueArray[m._id - 1] = Math.round(m.total / 1000);
  });

  const current = currentRevenue[0]?.total || 0;
  const previous = previousRevenue[0]?.total || 0;

  // Get AI insights
  const analysis = await aiService.analyzeRevenueTrend(
    monthlyRevenueArray,
    current,
    previous,
  );

  sendSuccess(res, 200, "Trend analysis complete", analysis);
});

// ── AI CHANNEL INSIGHTS (NEW) ────────────────────────────────────────
exports.getChannelInsights = asyncWrapper(async (req, res) => {
  const merchantId = req.user._id;

  // Get channel distribution (add source field to Order model)
  // For now, calculate from existing data or use defaults
  const totalOrders = await Order.countDocuments({
    "items.merchantId": merchantId,
  });

  // In production: add source tracking to Order schema
  // For MVP: use AI to analyze and suggest
  const webPct = 58,
    appPct = 27,
    socialPct = 15; // Can be made dynamic

  const insights = await aiService.getChannelInsights(
    webPct,
    appPct,
    socialPct,
  );

  sendSuccess(res, 200, "Channel insights generated", {
    distribution: { web: webPct, app: appPct, social: socialPct },
    insights,
  });
});

exports.getAnalytics = asyncWrapper(async (req, res) => {
  const { range = "30d" } = req.query;
  const merchantId = req.user._id;

  // Get monthly revenue series
  const monthlyData = await Order.aggregate([
    { $match: { "items.merchantId": merchantId, paymentStatus: "paid" } },
    { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$total" } } },
    { $sort: { _id: 1 } },
  ]);

  const revenueSeries = new Array(12).fill(0);
  monthlyData.forEach((m) => {
    revenueSeries[m._id - 1] = Math.round(m.total / 1000);
  });

  const ordersSeries = revenueSeries.map((v) => Math.round(v * 0.35)); // approximate

  // Channel mix (add source field to Order model later)
  const channelMix = [
    { label: "Web", pct: 58, color: "#c9727a" },
    { label: "App", pct: 27, color: "#8b6aaf" },
    { label: "Social", pct: 15, color: "#c8a04a" },
  ];

  // Quick stats
  const newCustomers = await User.countDocuments({
    role: "customer",
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });

  // Get AOV
  const aovData = await Order.aggregate([
    { $match: { "items.merchantId": merchantId, paymentStatus: "paid" } },
    { $group: { _id: null, avg: { $avg: "$total" } } },
  ]);

  sendSuccess(res, 200, "Analytics fetched", {
    channelMix,
    revenueSeries,
    ordersSeries,
    quickStats: { newCustomers, repeatRate: 41 },
    aov: Math.round(aovData[0]?.avg || 365),
  });
});

exports.refreshForecast = asyncWrapper(async (req, res) => {
  const { productId } = req.params;
  const { days = 7 } = req.query;

  const product = await Product.findOne({
    _id: productId,
    merchantId: req.user._id,
    isActive: true,
  });

  if (!product) {
    return sendError(res, 404, "Product not found");
  }

  // Make sure price is valid
  const price = product.price > 0 ? product.price : 1500;
  const category = product.category || "shirts";

  const forecastResult = await aiService.forceForecast(
    product._id,
    category,
    price,
    parseInt(days),
  );

  if (!forecastResult || !forecastResult.forecast) {
    return sendError(res, 500, "Failed to generate forecast");
  }

  await Product.findByIdAndUpdate(product._id, {
    forecastData: forecastResult.forecast,
    forecastUpdatedAt: new Date(),
  });

  sendSuccess(res, 200, "Forecast refreshed", {
    productId: product._id,
    forecast: forecastResult.forecast,
  });
});

// ── BATCH REFRESH ALL FORECASTS ───────────────────────────────────────
exports.refreshAllForecasts = asyncWrapper(async (req, res) => {
  const merchantId = req.user._id;
  const { days = 7 } = req.query;

  // Get all active products for this merchant
  const products = await Product.find({
    merchantId,
    isActive: true,
  }).select("_id category price name");

  if (products.length === 0) {
    return sendSuccess(res, 200, "No products to refresh", []);
  }

  // Batch call to Flask
  const batchResult = await aiService.batchForecast(products, parseInt(days));

  if (!batchResult || !batchResult.results) {
    return sendError(res, 500, "Failed to generate forecasts");
  }

  // Update each product with new forecast
  const updates = [];
  for (const result of batchResult.results) {
    if (result.forecast && result.forecast.length > 0) {
      updates.push(
        Product.findByIdAndUpdate(result.product_id, {
          forecastData: result.forecast,
          forecastUpdatedAt: new Date(),
        }),
      );
    }
  }
  await Promise.all(updates);

  sendSuccess(res, 200, "All forecasts refreshed", {
    count: updates.length,
    generatedAt: batchResult.generated_at,
  });
});

// ── RESOLVE VIOLATION ───────────────────────────────────────────────
// ── RESOLVE VIOLATION ───────────────────────────────────────────────
exports.resolveViolation = asyncWrapper(async (req, res) => {
  const { violationId } = req.params;

  const auditLog = await AuditLog.findOne({
    _id: violationId,
    merchantId: req.user._id,
  });

  if (!auditLog) {
    return sendError(res, 404, "Violation not found");
  }

  await AuditLog.findByIdAndUpdate(violationId, {
    isViolation: false,
    resolvedAt: new Date(),
    resolvedBy: req.user._id,
    violationDetails: `${auditLog.violationDetails || ""} (Resolved on ${new Date().toISOString()})`,
  });

  sendSuccess(res, 200, "Violation marked as resolved");
});

// ── BATCH RESOLVE VIOLATIONS ─────────────────────────────────────────
exports.batchResolveViolations = asyncWrapper(async (req, res) => {
  const { violationIds } = req.body;

  if (!Array.isArray(violationIds) || violationIds.length === 0) {
    return sendError(res, 400, "Violation IDs array is required");
  }

  const result = await AuditLog.updateMany(
    {
      _id: { $in: violationIds },
      merchantId: req.user._id,
      isViolation: true,
    },
    {
      $set: {
        isViolation: false,
        resolvedAt: new Date(),
        resolvedBy: req.user._id,
      },
    },
  );

  sendSuccess(res, 200, `${result.modifiedCount} violations resolved`, {
    resolvedCount: result.modifiedCount,
  });
});

// ── EXPORT COMPLIANCE REPORT ─────────────────────────────────────────
exports.exportComplianceReport = asyncWrapper(async (req, res) => {
  const merchantId = req.user._id;
  const { format = "json" } = req.query; // json or pdf

  // Get merchant data
  const merchant = await User.findById(merchantId).select("name email");

  const [products, auditLogs, violations, passedChecks] = await Promise.all([
    Product.find({ merchantId, isActive: true }).select(
      "name price category description stock createdAt",
    ),
    AuditLog.find({ merchantId }).sort({ createdAt: -1 }).limit(100),
    AuditLog.find({ merchantId, isViolation: true }).sort({ createdAt: -1 }),
    AuditLog.find({ merchantId, isViolation: false }).sort({ createdAt: -1 }),
  ]);

  const totalChecks = violations.length + passedChecks.length;
  const score =
    totalChecks > 0 ? Math.round((passedChecks.length / totalChecks) * 100) : 0;

  const reportData = {
    generatedAt: new Date().toISOString(),
    merchant: {
      name: merchant.name,
      email: merchant.email,
      id: merchantId,
    },
    summary: {
      totalChecks,
      violations: violations.length,
      passed: passedChecks.length,
      score,
      status: score >= 80 ? "compliant" : score >= 60 ? "attention" : "risk",
    },
    violations: violations.map((v) => ({
      id: v._id,
      rule: v.relatedRule,
      action: v.actionType,
      details: v.violationDetails,
      detected: v.createdAt,
      summary: v.summary,
    })),
    passedChecks: passedChecks.map((p) => ({
      rule: p.relatedRule,
      action: p.actionType,
      summary: p.summary,
      checked: p.createdAt,
    })),
    auditLogs: auditLogs.slice(0, 50).map((log) => ({
      timestamp: log.createdAt,
      action: log.actionType,
      rule: log.relatedRule,
      isViolation: log.isViolation,
    })),
    products: products.map((p) => ({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
    })),
  };

  if (format === "pdf") {
    // Call Flask to generate PDF
    try {
      const pdfBuffer = await aiService.generateCompliancePDF(reportData);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=compliance-report-${Date.now()}.pdf`,
      );
      return res.send(pdfBuffer);
    } catch (err) {
      console.error("PDF generation failed:", err.message);
      // Fallback to JSON
    }
  }

  // Default: return JSON
  sendSuccess(res, 200, "Compliance report generated", reportData);
});

// ── GET SINGLE VIOLATION DETAILS ──────────────────────────────────────
exports.getViolationDetails = asyncWrapper(async (req, res) => {
  const { violationId } = req.params;

  const violation = await AuditLog.findOne({
    _id: violationId,
    merchantId: req.user._id,
  });

  if (!violation) {
    return sendError(res, 404, "Violation not found");
  }

  sendSuccess(res, 200, "Violation details fetched", violation);
});
