const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncWrapper = require('../utils/asyncWrapper');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ── GET CART ──────────────────────────────────────────────────────────
exports.getCart = asyncWrapper(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    // Return empty cart instead of 404
    return sendSuccess(res, 200, 'Cart fetched', { items: [], total: 0, discount: 0 });
  }
  sendSuccess(res, 200, 'Cart fetched', cart);
});

// ── ADD ITEM TO CART ──────────────────────────────────────────────────
exports.addToCart = asyncWrapper(async (req, res) => {
  const { productId, qty = 1 } = req.body;

  // Validate product exists and is active
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) return sendError(res, 404, 'Product not found.');
  if (product.stock < qty) return sendError(res, 400, `Only ${product.stock} units available.`);

  let cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    // Create new cart for this user
    cart = await Cart.create({
      userId: req.user._id,
      items: [{
        productId: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.price,
        qty,
      }],
    });
  } else {
    // Check if item already in cart
    const existingIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingIndex > -1) {
      // Update quantity
      const newQty = cart.items[existingIndex].qty + qty;
      if (newQty > product.stock) {
        return sendError(res, 400, `Only ${product.stock} units available.`);
      }
      cart.items[existingIndex].qty = newQty;
    } else {
      // Add new item
      cart.items.push({
        productId: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.price,
        qty,
      });
    }
    await cart.save();
  }

  sendSuccess(res, 200, 'Item added to cart', cart);
});

// ── UPDATE CART ITEM QUANTITY ─────────────────────────────────────────
exports.updateCartItem = asyncWrapper(async (req, res) => {
  const { qty } = req.body;
  const { itemId } = req.params;

  if (qty < 1) return sendError(res, 400, 'Quantity must be at least 1.');

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) return sendError(res, 404, 'Cart not found.');

  const item = cart.items.find(i => i.productId.toString() === itemId);
  if (!item) return sendError(res, 404, 'Item not found in cart.');

  // Check stock
  const product = await Product.findById(itemId);
  if (product && qty > product.stock) {
    return sendError(res, 400, `Only ${product.stock} units available.`);
  }

  item.qty = qty;
  await cart.save();

  sendSuccess(res, 200, 'Cart updated', cart);
});

// ── REMOVE ITEM FROM CART ─────────────────────────────────────────────
exports.removeFromCart = asyncWrapper(async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) return sendError(res, 404, 'Cart not found.');

  cart.items = cart.items.filter(i => i.productId.toString() !== itemId);
  await cart.save();

  sendSuccess(res, 200, 'Item removed from cart', cart);
});

// ── CLEAR CART ────────────────────────────────────────────────────────
exports.clearCart = asyncWrapper(async (req, res) => {
  await Cart.deleteOne({ userId: req.user._id });
  sendSuccess(res, 200, 'Cart cleared.');
});

// ── APPLY PROMO CODE ──────────────────────────────────────────────────
exports.applyPromoCode = asyncWrapper(async (req, res) => {
  const { promoCode } = req.body;

  // Simple promo codes — extend this with a PromoCode model later
  const promoCodes = {
    'SAVE10': 10,
    'WELCOME20': 20,
    'FYP50': 50,
  };

  const discount = promoCodes[promoCode?.toUpperCase()];
  if (!discount) return sendError(res, 400, 'Invalid or expired promo code.');

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) return sendError(res, 404, 'Cart not found.');

  cart.promoCode = promoCode.toUpperCase();
  cart.discount = discount;
  await cart.save();

  sendSuccess(res, 200, `Promo code applied! You save Rs. ${discount}`, cart);
});
