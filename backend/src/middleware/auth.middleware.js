const { verifyToken } = require('../utils/jwtHelper');
const { sendError } = require('../utils/responseHelper');
const asyncWrapper = require('../utils/asyncWrapper');
const User = require('../models/User');

// ── Verify JWT ────────────────────────────────────────────────────────
// Fetches fresh user from DB so suspended accounts are blocked immediately
const verifyJWT = asyncWrapper(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return sendError(res, 401, 'Access denied. No token provided.');

  const decoded = verifyToken(token); // throws if invalid/expired
  const user = await User.findById(decoded.id).select('-passwordHash');
  if (!user) return sendError(res, 401, 'User no longer exists.');
  if (user.isSuspended) return sendError(res, 403, 'Account suspended. Contact support.');

  req.user = user;
  next();
});

// ── Role Guards ───────────────────────────────────────────────────────
const requireMerchant = (req, res, next) => {
  if (req.user?.role !== 'merchant') {
    return sendError(res, 403, 'Access denied. Merchant account required.');
  }
  next();
};

const requireCustomer = (req, res, next) => {
  if (req.user?.role !== 'customer') {
    return sendError(res, 403, 'Access denied. Customer account required.');
  }
  next();
};

// ── Ownership Guard ───────────────────────────────────────────────────
// Prevents Merchant A from editing Merchant B's products
const requireOwnership = (Model) => asyncWrapper(async (req, res, next) => {
  const resource = await Model.findById(req.params.id);
  if (!resource) return sendError(res, 404, 'Resource not found.');
  if (resource.merchantId.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Access denied. You do not own this resource.');
  }
  req.resource = resource; // attach to req so controller can reuse it
  next();
});

module.exports = { verifyJWT, requireMerchant, requireCustomer, requireOwnership };
