const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },             // First product image URL
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1, default: 1 },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User',
    required: true, unique: true,      // One cart per user
  },
  items: [cartItemSchema],
  promoCode: { type: String, default: null },
  discount: { type: Number, default: 0 },
}, { timestamps: true });

// ── Virtual: Calculate total ─────────────────────────────────────────
cartSchema.virtual('total').get(function () {
  const subtotal = this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return subtotal - this.discount;
});

module.exports = mongoose.model('Cart', cartSchema);
