const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { verifyJWT } = require('../middleware/auth.middleware');
const { uploadAvatar } = require('../middleware/upload.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// All user routes require login
router.use(verifyJWT);

// ── Profile ───────────────────────────────────────────────────────────
router.get('/profile',  ctrl.getProfile);                // GET   /api/users/profile
router.put('/profile',                                   // PUT   /api/users/profile
  uploadAvatar,
  [
    body('name').optional().trim()
      .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('phone').optional().trim()
      .isMobilePhone().withMessage('Invalid phone number'),
    validate,
  ],
  ctrl.updateProfile
);

// ── Addresses ─────────────────────────────────────────────────────────
router.get('/addresses',  ctrl.getAddresses);            // GET    /api/users/addresses

router.post('/addresses',                                // POST   /api/users/addresses
  [
    body('street').trim().notEmpty().withMessage('Street is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('label').optional().isIn(['home', 'work', 'other']),
    validate,
  ],
  ctrl.addAddress
);

router.put('/addresses/:addressId',                      // PUT    /api/users/addresses/:id
  [
    body('street').optional().trim().notEmpty(),
    body('city').optional().trim().notEmpty(),
    body('label').optional().isIn(['home', 'work', 'other']),
    validate,
  ],
  ctrl.updateAddress
);

router.delete('/addresses/:addressId', ctrl.deleteAddress);       // DELETE /api/users/addresses/:id
router.patch('/addresses/:addressId/default', ctrl.setDefaultAddress); // PATCH /api/users/addresses/:id/default

module.exports = router;
