const mongoose = require('mongoose');

// Seeded data used by the dynamic pricing engine
const competitorPricesSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  competitorName: { type: String, required: true, trim: true },
  competitorPrice: { type: Number, required: true, min: 0 },
  ourPrice: { type: Number, required: true, min: 0 },
  fetchedAt: { type: Date, default: Date.now },
}, { timestamps: true });

competitorPricesSchema.index({ productId: 1, fetchedAt: -1 });

module.exports = mongoose.model('CompetitorPrices', competitorPricesSchema);
