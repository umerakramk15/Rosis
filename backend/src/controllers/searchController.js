const Product = require('../models/Product');
const asyncWrapper = require('../utils/asyncWrapper');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const aiService = require('../services/aiService');

// ── VISUAL SEARCH ─────────────────────────────────────────────────────
// Receives base64 image → Flask extracts keywords → MongoDB text search
exports.visualSearch = asyncWrapper(async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return sendError(res, 400, 'Image data is required.');

  // Call Flask → returns array of keywords e.g. ['blue', 'shirt', 'cotton']
  const keywords = await aiService.visualSearch(imageBase64);

  // Search MongoDB using keywords
  const searchQuery = Array.isArray(keywords) ? keywords.join(' ') : keywords;

  const products = await Product.find({
    isActive: true,
    $text: { $search: searchQuery },
  })
    .sort({ score: { $meta: 'textScore' } })
    .limit(12)
    .select('name price images ratings category');

  // Fallback: if text search returns nothing, search by category
  if (products.length === 0) {
    const fallback = await Product.find({ isActive: true })
      .limit(12)
      .select('name price images ratings category');

    return sendSuccess(res, 200, 'Visual search results (fallback)', {
      products: fallback,
      keywords,
      source: 'fallback',
    });
  }

  sendSuccess(res, 200, 'Visual search results', {
    products,
    keywords,
    source: 'ai',
  });
});

// ── LLM SMART SEARCH ──────────────────────────────────────────────────
// Receives natural language → Flask extracts filters → MongoDB filtered search
exports.llmSearch = asyncWrapper(async (req, res) => {
  const { query } = req.body;
  if (!query || query.trim().length < 2) {
    return sendError(res, 400, 'Search query is required.');
  }

  // Call Flask → returns { category, color, max_price, material, occasion }
  const extractedFilters = await aiService.llmSearch(query.trim());

  // Build MongoDB filter from extracted fields
  const filter = { isActive: true };

  if (extractedFilters.category) {
    filter.category = new RegExp(extractedFilters.category, 'i');
  }
  if (extractedFilters.max_price) {
    filter.price = { $lte: parseFloat(extractedFilters.max_price) };
  }
  if (extractedFilters.material || extractedFilters.color || extractedFilters.occasion) {
    // Search description for these attributes
    const descSearch = [
      extractedFilters.material,
      extractedFilters.color,
      extractedFilters.occasion,
    ].filter(Boolean).join(' ');

    filter.$text = { $search: descSearch };
  }

  const products = await Product.find(filter)
    .sort({ 'ratings.average': -1 })
    .limit(15)
    .select('name price images ratings category description');

  sendSuccess(res, 200, 'Smart search results', {
    products,
    extractedFilters, // Send back so frontend can show AIInterpretationChips
    originalQuery: query,
  });
});

// ── KEYWORD SEARCH ────────────────────────────────────────────────────
// Regular search bar — no AI involved
exports.keywordSearch = asyncWrapper(async (req, res) => {
  const { q, category, minPrice, maxPrice, sortBy = 'score', page = 1, limit = 20 } = req.query;

  if (!q || q.trim().length < 1) {
    return sendError(res, 400, 'Search query is required.');
  }

  const filter = { isActive: true, $text: { $search: q.trim() } };
  if (category) filter.category = new RegExp(category, 'i');
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip     = (pageNum - 1) * limitNum;

  const sortOptions = sortBy === 'price_asc'  ? { price: 1 }
    : sortBy === 'price_desc' ? { price: -1 }
    : sortBy === 'rating'     ? { 'ratings.average': -1 }
    : { score: { $meta: 'textScore' } }; // default: relevance

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('name price images ratings category'),
    Product.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Search results', {
    products, total, query: q,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});
