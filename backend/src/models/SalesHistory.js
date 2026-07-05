const mongoose = require('mongoose');

// Used by Flask ML model for demand forecasting training & inference
const salesHistorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  unitsSold: { type: Number, required: true, min: 0 },
  revenue: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true },
  dayOfWeek: { type: Number, min: 0, max: 6 },   // 0=Sunday, 6=Saturday
  month: { type: Number, min: 1, max: 12 },
  category: { type: String },
}, { timestamps: true });

salesHistorySchema.index({ productId: 1, date: -1 });
salesHistorySchema.index({ merchantId: 1, date: -1 });

module.exports = mongoose.model('SalesHistory', salesHistorySchema);
