const router = require('express').Router();
const ctrl = require('../controllers/wishlistController');
const { verifyJWT } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// All wishlist routes require login
router.use(verifyJWT);

router.get('/', ctrl.getWishlist);                        // GET    /api/wishlist

router.post('/toggle',                                    // POST   /api/wishlist/toggle
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    validate,
  ],
  ctrl.toggleWishlist
);

router.post('/move-to-cart',                              // POST   /api/wishlist/move-to-cart
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    validate,
  ],
  ctrl.moveToCart
);

router.delete('/clear', ctrl.clearWishlist);              // DELETE /api/wishlist/clear

module.exports = router;
