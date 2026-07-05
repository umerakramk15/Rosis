const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const asyncWrapper = require("../utils/asyncWrapper");
const { sendSuccess, sendError } = require("../utils/responseHelper");

// ── GET REVIEWS for a product (public) with filtering & sorting ─────────
exports.getReviews = asyncWrapper(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    rating, // Filter by specific rating (1-5)
    sortBy = "newest", // helpful, newest, rating
  } = req.query;

  const productId = req.params.id;

  // Build filter
  const filter = { productId };
  if (rating && [1, 2, 3, 4, 5].includes(parseInt(rating))) {
    filter.rating = parseInt(rating);
  }

  // Build sort
  let sort = {};
  switch (sortBy) {
    case "helpful":
      sort = { helpful: -1, createdAt: -1 };
      break;
    case "rating":
      sort = { rating: -1, createdAt: -1 };
      break;
    case "newest":
    default:
      sort = { createdAt: -1 };
      break;
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(20, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("userId", "name avatar")
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments(filter),
  ]);

  // Get rating breakdown for this product
  const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const allRatings = await Review.find({ productId }).select("rating");
  allRatings.forEach((r) => {
    ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1;
  });

  sendSuccess(res, 200, "Reviews fetched", {
    reviews,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    ratingBreakdown,
    activeFilter: rating ? parseInt(rating) : 0,
    activeSort: sortBy,
  });
});

// ── ADD REVIEW (customer only, must have ordered product) ─────────────
exports.addReview = asyncWrapper(async (req, res) => {
  const { rating, comment, title, size, color } = req.body;
  const productId = req.params.id;

  if (!rating || rating < 1 || rating > 5) {
    return sendError(res, 400, "Rating must be between 1 and 5.");
  }

  // Check product exists
  const product = await Product.findById(productId);
  if (!product) return sendError(res, 404, "Product not found.");

  // Check if user already reviewed
  const existing = await Review.findOne({ productId, userId: req.user._id });
  if (existing)
    return sendError(res, 409, "You have already reviewed this product.");

  // ── NEW: Check if user has purchased AND received this product ────────
  const hasPurchased = await Order.findOne({
    userId: req.user._id,
    "items.productId": productId,
    orderStatus: { $in: ["delivered", "shipped"] }, // Only delivered or shipped orders
  });

  const verified = !!hasPurchased;

  // If not verified, still allow review but without verified badge
  // if (!verified) {
  //   return sendError(res, 403, 'You can only review products you have purchased and received.');
  // }

  const review = await Review.create({
    productId,
    userId: req.user._id,
    rating: parseInt(rating),
    comment: comment?.trim() || "",
    title: title?.trim() || "",
    size: size?.trim() || "",
    color: color?.trim() || "",
    verified,
  });

  await review.populate("userId", "name avatar");

  sendSuccess(res, 201, "Review added successfully", review);
});

// ── DELETE REVIEW (only own review) ──────────────────────────────────
exports.deleteReview = asyncWrapper(async (req, res) => {
  const review = await Review.findOneAndDelete({
    _id: req.params.reviewId,
    userId: req.user._id,
  });
  if (!review) return sendError(res, 404, "Review not found or not yours.");
  sendSuccess(res, 200, "Review deleted successfully.");
});

// ── NEW: MARK REVIEW AS HELPFUL ────────────────────────────────────────
exports.markHelpful = asyncWrapper(async (req, res) => {
  const { productId, reviewId } = req.params;
  const userId = req.user._id;

  // Find the review
  const review = await Review.findOne({ _id: reviewId, productId });
  if (!review) return sendError(res, 404, "Review not found.");

  // Check if user already voted
  if (review.helpfulUsers.includes(userId)) {
    return sendError(
      res,
      400,
      "You have already marked this review as helpful.",
    );
  }

  // Add vote
  review.helpfulUsers.push(userId);
  review.helpful += 1;
  await review.save();

  sendSuccess(res, 200, "Review marked as helpful", {
    helpful: review.helpful,
  });
});

// ── NEW: REMOVE HELPFUL MARK ──────────────────────────────────────────
exports.removeHelpful = asyncWrapper(async (req, res) => {
  const { productId, reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findOne({ _id: reviewId, productId });
  if (!review) return sendError(res, 404, "Review not found.");

  // Check if user has voted
  if (!review.helpfulUsers.includes(userId)) {
    return sendError(res, 400, "You have not marked this review as helpful.");
  }

  // Remove vote
  review.helpfulUsers = review.helpfulUsers.filter(
    (id) => id.toString() !== userId.toString(),
  );
  review.helpful = Math.max(0, review.helpful - 1);
  await review.save();

  sendSuccess(res, 200, "Helpful mark removed", { helpful: review.helpful });
});

// ── NEW: GET REVIEW SUMMARY (for product page rating bars) ─────────────
exports.getReviewSummary = asyncWrapper(async (req, res) => {
  const { id: productId } = req.params;

  const [totalReviews, ratingBreakdown] = await Promise.all([
    Review.countDocuments({ productId }),
    Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]),
  ]);

  // Get average rating
  const avgResult = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: null, average: { $avg: "$rating" } } },
  ]);

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratingBreakdown.forEach((item) => {
    breakdown[item._id] = item.count;
  });

  sendSuccess(res, 200, "Review summary fetched", {
    average: avgResult[0]?.average || 0,
    count: totalReviews,
    breakdown,
  });
});

// ── NEW: GET USER'S REVIEW (for profile page) ──────────────────────────
exports.getMyReviews = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(20, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find({ userId: req.user._id })
      .populate("productId", "name images price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments({ userId: req.user._id }),
  ]);

  sendSuccess(res, 200, "My reviews fetched", {
    reviews,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

// ── UPDATE REVIEW (edit existing review) ───────────────────────────────
exports.updateReview = asyncWrapper(async (req, res) => {
  const { productId, reviewId } = req.params;
  const { rating, comment, title, size, color } = req.body;

  const review = await Review.findOne({
    _id: reviewId,
    productId,
    userId: req.user._id,
  });
  if (!review) return sendError(res, 404, "Review not found or not yours.");

  if (rating && rating >= 1 && rating <= 5) review.rating = parseInt(rating);
  if (comment !== undefined) review.comment = comment?.trim() || "";
  if (title !== undefined) review.title = title?.trim() || "";
  if (size !== undefined) review.size = size?.trim() || "";
  if (color !== undefined) review.color = color?.trim() || "";

  await review.save();
  await review.populate("userId", "name avatar");

  sendSuccess(res, 200, "Review updated successfully", review);
});
