const router = require('express').Router();
const ctrl = require('../controllers/cartController');
const { verifyJWT } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// All cart routes require login
router.use(verifyJWT);

router.get('/', ctrl.getCart);                            // GET  /api/cart

router.post('/add',                                       // POST /api/cart/add
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('qty').optional().isInt({ min: 1 }).withMessage('Qty must be at least 1'),
    validate,
  ],
  ctrl.addToCart
);

router.put('/item/:itemId',                               // PUT  /api/cart/item/:itemId
  [
    body('qty').isInt({ min: 1 }).withMessage('Qty must be at least 1'),
    validate,
  ],
  ctrl.updateCartItem
);

router.delete('/item/:itemId', ctrl.removeFromCart);      // DELETE /api/cart/item/:itemId
router.delete('/clear', ctrl.clearCart);                  // DELETE /api/cart/clear

router.post('/promo',                                     // POST /api/cart/promo
  [
    body('promoCode').trim().notEmpty().withMessage('Promo code is required'),
    validate,
  ],
  ctrl.applyPromoCode
);

module.exports = router;
