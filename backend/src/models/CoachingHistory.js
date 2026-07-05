const mongoose = require('mongoose');

// Stores Groq-generated coaching insights per merchant
const coachingHistorySchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kpis: {
    revenue: { type: Number },
    totalOrders: { type: Number },
    returnRate: { type: Number },
    topProduct: { type: String },
  },
  insights: [{ type: String }],    // Array of LLM-generated insight strings
  generatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

coachingHistorySchema.index({ merchantId: 1, generatedAt: -1 });

module.exports = mongoose.model('CoachingHistory', coachingHistorySchema);
