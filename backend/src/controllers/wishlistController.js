const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const asyncWrapper = require('../utils/asyncWrapper');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ── GET WISHLIST ──────────────────────────────────────────────────────
exports.getWishlist = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'name price images ratings isActive category');

  // Filter out deleted products
  const activeWishlist = user.wishlist.filter(p => p.isActive);

  sendSuccess(res, 200, 'Wishlist fetched', { wishlist: activeWishlist });
});

// ── TOGGLE WISHLIST (add if not in, remove if already in) ────────────
exports.toggleWishlist = asyncWrapper(async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) return sendError(res, 404, 'Product not found.');

  const user = await User.findById(req.user._id);
  const isInWishlist = user.wishlist.includes(productId);

  if (isInWishlist) {
    // Remove from wishlist
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    return sendSuccess(res, 200, 'Removed from wishlist', { added: false });
  } else {
    // Add to wishlist
    user.wishlist.push(productId);
    await user.save();
    return sendSuccess(res, 200, 'Added to wishlist', { added: true });
  }
});

// ── MOVE ITEM FROM WISHLIST TO CART ──────────────────────────────────
exports.moveToCart = asyncWrapper(async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) return sendError(res, 404, 'Product not found.');
  if (product.stock < 1) return sendError(res, 400, 'Product is out of stock.');

  // Add to cart
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    cart = await Cart.create({
      userId: req.user._id,
      items: [{
        productId: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.price,
        qty: 1,
      }],
    });
  } else {
    const existingIndex = cart.items.findIndex(
      i => i.productId.toString() === productId
    );
    if (existingIndex > -1) {
      cart.items[existingIndex].qty += 1;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.price,
        qty: 1,
      });
    }
    await cart.save();
  }

  // Remove from wishlist
  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  await user.save();

  sendSuccess(res, 200, 'Item moved to cart', { cart });
});

// ── CLEAR ENTIRE WISHLIST ─────────────────────────────────────────────
exports.clearWishlist = asyncWrapper(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { wishlist: [] });
  sendSuccess(res, 200, 'Wishlist cleared.');
});
