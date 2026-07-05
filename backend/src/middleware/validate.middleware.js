const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHelper');

// ── Run validation result — attach after validator chains ────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => `${e.path}: ${e.msg}`);
    return sendError(res, 422, 'Validation failed: ' + messages.join(' | '));
  }
  next();
};

// ── Auth Validators ──────────────────────────────────────────────────
const registerValidator = [
  body('name')
    .trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email')
    .trim().isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must have uppercase, lowercase, number, and special character'),
  body('role')
    .isIn(['customer', 'merchant']).withMessage('Role must be customer or merchant'),
  validate,
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  validate,
];

const resetPasswordValidator = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must have uppercase, lowercase, number, and special character'),
  validate,
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('New password must have uppercase, lowercase, number, and special character'),
  validate,
];

// ── Product Validators ───────────────────────────────────────────────
const productValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required')
    .isLength({ min: 3, max: 200 }),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('description').optional().trim().isLength({ max: 2000 }),
  validate,
];

// ── Order Validators ─────────────────────────────────────────────────
const orderValidator = [
  body('shippingAddress.street').trim().notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  validate,
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  productValidator,
  orderValidator,
};
