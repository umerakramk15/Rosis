const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, trim: true, maxlength: 100 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },

    size: { type: String, trim: true },
    color: { type: String, trim: true },

    helpful: { type: Number, default: 0 },
    helpfulUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    verified: { type: Boolean, default: false },
    images: [{ type: String }],
  },
  { timestamps: true },
);

// ── Indexes (NO DUPLICATES) ─────────────────────────────────────────────
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ productId: 1, helpful: -1 });
reviewSchema.index({ productId: 1, rating: -1 });
reviewSchema.index({ userId: 1 });

// ── Method: Mark review as helpful ──────────────────────────────────────
reviewSchema.methods.markHelpful = async function (userId) {
  if (this.helpfulUsers.includes(userId)) {
    return { success: false, message: "Already marked helpful" };
  }
  this.helpfulUsers.push(userId);
  this.helpful += 1;
  await this.save();
  return { success: true, helpful: this.helpful };
};

// ── Method: Check if user already voted ─────────────────────────────────
reviewSchema.methods.hasUserVoted = function (userId) {
  return this.helpfulUsers.includes(userId);
};

// ── Post-save: Update product ratings ───────────────────────────────────
reviewSchema.post("save", async function () {
  const Product = require("./Product");

  const allReviews = await mongoose
    .model("Review")
    .find({ productId: this.productId });

  const total = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const average = total / allReviews.length;

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  allReviews.forEach((r) => {
    breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
  });

  await Product.findByIdAndUpdate(this.productId, {
    "ratings.average": Math.round(average * 10) / 10,
    "ratings.count": allReviews.length,
    "ratings.breakdown": breakdown,
  });
});

// ── Post-delete: Update product ratings ─────────────────────────────────
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;
  const Product = require("./Product");

  const allReviews = await mongoose
    .model("Review")
    .find({ productId: doc.productId });

  if (allReviews.length === 0) {
    await Product.findByIdAndUpdate(doc.productId, {
      "ratings.average": 0,
      "ratings.count": 0,
      "ratings.breakdown": { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    });
    return;
  }

  const total = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const average = total / allReviews.length;

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  allReviews.forEach((r) => {
    breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
  });

  await Product.findByIdAndUpdate(doc.productId, {
    "ratings.average": Math.round(average * 10) / 10,
    "ratings.count": allReviews.length,
    "ratings.breakdown": breakdown,
  });
});

module.exports = mongoose.model("Review", reviewSchema);
