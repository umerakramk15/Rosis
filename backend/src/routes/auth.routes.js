const router = require('express').Router();
const auth = require('../controllers/authController');
const { verifyJWT } = require('../middleware/auth.middleware');
const { authLimiter, resetLimiter } = require('../middleware/rateLimit.middleware');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require('../middleware/validate.middleware');

// ── Public Routes ─────────────────────────────────────────────────────
router.post('/register',        authLimiter, registerValidator,       auth.register);
router.post('/login',           authLimiter, loginValidator,          auth.login);
router.post('/refresh-token',                                          auth.refreshToken);
router.post('/forgot-password', resetLimiter, forgotPasswordValidator, auth.forgotPassword);
router.patch('/reset-password/:token', resetPasswordValidator,         auth.resetPassword);

// ── Protected Routes (require login) ─────────────────────────────────
router.get('/me',              verifyJWT, auth.getMe);
router.post('/logout',         verifyJWT, auth.logout);
router.patch('/change-password', verifyJWT, changePasswordValidator, auth.changePassword);

module.exports = router;
