const crypto = require('crypto');
const User = require('../models/User');
const Token = require('../models/Token');
const asyncWrapper = require('../utils/asyncWrapper');
const { signToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwtHelper');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');

// ── Helper: build safe user object for response ──────────────────────
const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
});

// ── REGISTER ─────────────────────────────────────────────────────────
exports.register = asyncWrapper(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return sendError(res, 409, 'Email already registered.');

  // passwordHash field triggers the pre-save bcrypt hook in User model
  const user = await User.create({ name, email, passwordHash: password, role });

  // Send welcome email — async, don't block response
  sendWelcomeEmail(user.email, user.name).catch(console.error);

  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  sendSuccess(res, 201, 'Account created successfully', {
    token, refreshToken, user: safeUser(user),
  });
});

// ── LOGIN ─────────────────────────────────────────────────────────────
exports.login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select passwordHash — it has select: false in schema
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) return sendError(res, 401, 'Invalid email or password.');
  if (user.isSuspended) return sendError(res, 403, 'Account suspended. Contact support.');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return sendError(res, 401, 'Invalid email or password.');

  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  sendSuccess(res, 200, 'Login successful', {
    token, refreshToken, user: safeUser(user),
  });
});

// ── REFRESH TOKEN ─────────────────────────────────────────────────────
exports.refreshToken = asyncWrapper(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return sendError(res, 401, 'Refresh token required.');

  const decoded = verifyRefreshToken(refreshToken); // throws if invalid
  const user = await User.findById(decoded.id);
  if (!user) return sendError(res, 401, 'User not found.');
  if (user.isSuspended) return sendError(res, 403, 'Account suspended.');

  const newToken = signToken(user._id);
  sendSuccess(res, 200, 'Token refreshed', { token: newToken });
});

// ── FORGOT PASSWORD ───────────────────────────────────────────────────
exports.forgotPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always return same message — don't reveal if email exists (security)
  const MSG = 'If that email is registered, a reset link has been sent.';
  if (!user) return sendSuccess(res, 200, MSG);

  // Generate secure raw token
  const rawToken = crypto.randomBytes(32).toString('hex');

  // Store only the hash — never the raw token
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Delete any old reset tokens for this user
  await Token.deleteMany({ userId: user._id, type: 'passwordReset' });

  await Token.create({
    userId: user._id,
    tokenHash,
    type: 'passwordReset',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;
  await sendPasswordResetEmail(user.email, user.name, resetURL);

  sendSuccess(res, 200, MSG);
});

// ── RESET PASSWORD ────────────────────────────────────────────────────
exports.resetPassword = asyncWrapper(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash incoming token and find matching record
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const record = await Token.findOne({
    tokenHash,
    type: 'passwordReset',
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) return sendError(res, 400, 'Invalid or expired reset link.');

  const user = await User.findById(record.userId);
  if (!user) return sendError(res, 404, 'User not found.');

  // pre-save hook will hash the new password
  user.passwordHash = password;
  user.passwordChangedAt = new Date();
  await user.save();

  // Mark token as used so it can't be reused
  record.used = true;
  await record.save();

  sendSuccess(res, 200, 'Password reset successful. Please log in.');
});

// ── CHANGE PASSWORD (logged in) ───────────────────────────────────────
exports.changePassword = asyncWrapper(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+passwordHash');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return sendError(res, 401, 'Current password is incorrect.');

  user.passwordHash = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  sendSuccess(res, 200, 'Password changed successfully.');
});

// ── LOGOUT ────────────────────────────────────────────────────────────
// JWT is stateless — actual logout happens client-side (clear localStorage)
// For true server-side invalidation, add token to Redis blocklist here
exports.logout = asyncWrapper(async (req, res) => {
  sendSuccess(res, 200, 'Logged out successfully.');
});

// ── GET ME (current logged-in user) ──────────────────────────────────
exports.getMe = asyncWrapper(async (req, res) => {
  sendSuccess(res, 200, 'User fetched', { user: safeUser(req.user) });
});
