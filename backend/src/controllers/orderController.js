const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const SalesHistory = require('../models/SalesHistory');
const asyncWrapper = require('../utils/asyncWrapper');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { sendOrderConfirmationEmail } = require('../services/emailService');

// ── PLACE ORDER ───────────────────────────────────────────────────────
exports.placeOrder = asyncWrapper(async (req, res) => {
  const { shippingAddress, paymentIntentId } = req.body;

  // Get user cart
  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart || cart.items.length === 0) {
    return sendError(res, 400, 'Your cart is empty.');
  }

  // Validate stock for every item before placing order
  const stockErrors = [];
  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      stockErrors.push(`${item.name} is no longer available.`);
    } else if (product.stock < item.qty) {
      stockErrors.push(`${item.name}: only ${product.stock} units left.`);
    }
  }
  if (stockErrors.length > 0) {
    return sendError(res, 400, stockErrors.join(' | '));
  }

  // Calculate totals
  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = cart.discount || 0;
  const deliveryFee = subtotal > 2000 ? 0 : 150; // Free delivery above Rs. 2000
  const total = subtotal - discount + deliveryFee;

  // Build order items with merchantId snapshot
  const orderItems = await Promise.all(
    cart.items.map(async (item) => {
      const product = await Product.findById(item.productId).select('merchantId');
      return {
        productId: item.productId,
        merchantId: product.merchantId,
        name: item.name,
        qty: item.qty,
        price: item.price,
      };
    })
  );

  // Create order
  const order = await Order.create({
    userId: req.user._id,
    items: orderItems,
    subtotal,
    discount,
    deliveryFee,
    total,
    shippingAddress,
    paymentIntentId: paymentIntentId || null,
    paymentStatus: paymentIntentId ? 'paid' : 'pending',
    orderStatus: 'pending',
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
  });

  // Deduct stock for each product
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.qty },
    });
  }

  // Record sales history for AI forecasting
  for (const item of orderItems) {
    const now = new Date();
    await SalesHistory.create({
      productId: item.productId,
      merchantId: item.merchantId,
      date: now,
      unitsSold: item.qty,
      revenue: item.price * item.qty,
      price: item.price,
      dayOfWeek: now.getDay(),
      month: now.getMonth() + 1,
    });
  }

  // Clear cart after successful order
  await Cart.deleteOne({ userId: req.user._id });

  // Send confirmation email — async
  sendOrderConfirmationEmail(req.user.email, req.user.name, order)
    .catch(err => console.error('Order email failed:', err.message));

  sendSuccess(res, 201, 'Order placed successfully', order);
});

// ── GET ALL ORDERS (customer) ─────────────────────────────────────────
exports.getMyOrders = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const filter = { userId: req.user._id };
  if (status) filter.orderStatus = status;

  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
  const skip     = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Orders fetched', {
    orders, total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

// ── GET SINGLE ORDER (customer) ───────────────────────────────────────
exports.getOrderById = asyncWrapper(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user._id, // Ensure customer can only see own orders
  }).populate('items.productId', 'name images category');

  if (!order) return sendError(res, 404, 'Order not found.');
  sendSuccess(res, 200, 'Order fetched', order);
});

// ── CANCEL ORDER (customer) ───────────────────────────────────────────
exports.cancelOrder = asyncWrapper(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!order) return sendError(res, 404, 'Order not found.');

  // Only pending orders can be cancelled
  if (!['pending', 'confirmed'].includes(order.orderStatus)) {
    return sendError(res, 400, `Cannot cancel order with status: ${order.orderStatus}.`);
  }

  order.orderStatus = 'cancelled';
  await order.save();

  // Restore stock for each item
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.qty },
    });
  }

  sendSuccess(res, 200, 'Order cancelled successfully.', order);
});

// ── GET ALL MERCHANT ORDERS ───────────────────────────────────────────
exports.getMerchantOrders = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const filter = { 'items.merchantId': req.user._id };
  if (status) filter.orderStatus = status;

  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip     = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name email'),
    Order.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Merchant orders fetched', {
    orders, total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

// ── UPDATE ORDER STATUS (merchant) ───────────────────────────────────
exports.updateOrderStatus = asyncWrapper(async (req, res) => {
  const { status } = req.body;

  const allowedStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
  if (!allowedStatuses.includes(status)) {
    return sendError(res, 400, `Invalid status. Allowed: ${allowedStatuses.join(', ')}`);
  }

  // Ensure at least one item belongs to this merchant
  const order = await Order.findOne({
    _id: req.params.id,
    'items.merchantId': req.user._id,
  });

  if (!order) return sendError(res, 404, 'Order not found.');

  // Prevent going backwards in status
  const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusFlow.indexOf(order.orderStatus);
  const newIndex = statusFlow.indexOf(status);

  if (newIndex <= currentIndex) {
    return sendError(res, 400, `Cannot change status from ${order.orderStatus} to ${status}.`);
  }

  order.orderStatus = status;
  await order.save();

  sendSuccess(res, 200, `Order status updated to ${status}`, order);
});

// ── MERCHANT DASHBOARD KPIs ───────────────────────────────────────────
exports.getMerchantKPIs = asyncWrapper(async (req, res) => {
  const merchantId = req.user._id;

  const [totalRevenue, totalOrders, cancelledOrders, topProducts] = await Promise.all([
    // Total revenue
    Order.aggregate([
      { $match: { 'items.merchantId': merchantId, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),

    // Total orders
    Order.countDocuments({ 'items.merchantId': merchantId }),

    // Cancelled orders
    Order.countDocuments({ 'items.merchantId': merchantId, orderStatus: 'cancelled' }),

    // Top 5 products by units sold
    SalesHistory.aggregate([
      { $match: { merchantId } },
      { $group: { _id: '$productId', totalUnits: { $sum: '$unitsSold' }, totalRevenue: { $sum: '$revenue' } } },
      { $sort: { totalUnits: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', totalUnits: 1, totalRevenue: 1 } },
    ]),
  ]);

  const returnRate = totalOrders > 0
    ? ((cancelledOrders / totalOrders) * 100).toFixed(1)
    : 0;

  sendSuccess(res, 200, 'KPIs fetched', {
    revenue: totalRevenue[0]?.total || 0,
    totalOrders,
    cancelledOrders,
    returnRate: `${returnRate}%`,
    topProducts,
  });
});
