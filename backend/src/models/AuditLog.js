const mongoose = require('mongoose');

// Records merchant actions for the Compliance Assistant
const auditLogSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: {
    type: String,
    enum: ['product_created', 'product_updated', 'product_deleted', 'price_changed', 'order_status_updated'],
    required: true,
  },
  relatedRule: { type: String },           // Which compliance rule was checked
  isViolation: { type: Boolean, default: false },
  violationDetails: { type: String },      // What the violation was
  summary: { type: String },              // Groq-generated summary
  resourceId: { type: mongoose.Schema.Types.ObjectId }, // Product/Order ID involved
}, { timestamps: true });

auditLogSchema.index({ merchantId: 1, createdAt: -1 });
auditLogSchema.index({ merchantId: 1, isViolation: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
