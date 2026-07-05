const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },       // Snapshot at order time
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }, // Price locked at order time
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  province: String,
  postalCode: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  shippingAddress: shippingAddressSchema,
  paymentIntentId: { type: String },           // Stripe payment intent ID
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  estimatedDelivery: Date,
}, { timestamps: true });

// ── Indexes ──────────────────────────────────────────────────────────
orderSchema.index({ userId: 1, createdAt: -1 });   // Customer order history
orderSchema.index({ 'items.merchantId': 1 });       // Merchant order lookups

module.exports = mongoose.model('Order', orderSchema);
