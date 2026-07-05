const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/reviewController');
const { verifyJWT, requireCustomer } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// ── Validation Rules ───────────────────────────────────────────────────
const reviewValidator = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }),
  body('title').optional().trim().isLength({ max: 100 }),
  body('size').optional().trim().isLength({ max: 10 }),
  body('color').optional().trim().isLength({ max: 50 }),
  validate,
];

// ── PUBLIC ROUTES (no auth required) ───────────────────────────────────

// Get all reviews for a product (with filtering & sorting)
// Query params: ?page=1&limit=10&rating=5&sortBy=helpful
router.get('/', ctrl.getReviews);

// Get review summary (rating breakdown for product)
router.get('/summary', ctrl.getReviewSummary);

// ── PROTECTED ROUTES (require authentication) ──────────────────────────

// Add review (customer only)
router.post('/', verifyJWT, requireCustomer, reviewValidator, ctrl.addReview);

// Update review (own review only)
router.put('/:reviewId', verifyJWT, requireCustomer, reviewValidator, ctrl.updateReview);

// Delete review (own review only)
router.delete('/:reviewId', verifyJWT, requireCustomer, ctrl.deleteReview);

// ── NEW: Helpful vote routes ───────────────────────────────────────────

// Mark review as helpful
router.post('/:reviewId/helpful', verifyJWT, requireCustomer, ctrl.markHelpful);

// Remove helpful mark
router.delete('/:reviewId/helpful', verifyJWT, requireCustomer, ctrl.removeHelpful);

// ── USER'S OWN REVIEWS ─────────────────────────────────────────────────

// Get current user's reviews across all products
router.get('/user/my-reviews', verifyJWT, ctrl.getMyReviews);

module.exports = router;