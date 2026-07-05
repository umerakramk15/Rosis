const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { verifyJWT, requireMerchant } = require('../middleware/auth.middleware');
const { orderValidator } = require('../middleware/validate.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// ── Customer Routes ───────────────────────────────────────────────────
router.post('/',
  verifyJWT,
  orderValidator,
  ctrl.placeOrder                      // POST /api/orders
);

router.get('/my-orders',
  verifyJWT,
  ctrl.getMyOrders                     // GET  /api/orders/my-orders
);

router.get('/:id',
  verifyJWT,
  ctrl.getOrderById                    // GET  /api/orders/:id
);

router.patch('/:id/cancel',
  verifyJWT,
  ctrl.cancelOrder                     // PATCH /api/orders/:id/cancel
);

// ── Merchant Routes ───────────────────────────────────────────────────
router.get('/merchant/all',
  verifyJWT, requireMerchant,
  ctrl.getMerchantOrders               // GET  /api/orders/merchant/all
);

router.get('/merchant/kpis',
  verifyJWT, requireMerchant,
  ctrl.getMerchantKPIs                 // GET  /api/orders/merchant/kpis
);

router.patch('/:id/status',
  verifyJWT, requireMerchant,
  [
    body('status')
      .notEmpty().withMessage('Status is required')
      .isIn(['confirmed', 'processing', 'shipped', 'delivered'])
      .withMessage('Invalid status value'),
    validate,
  ],
  ctrl.updateOrderStatus               // PATCH /api/orders/:id/status
);

module.exports = router;
