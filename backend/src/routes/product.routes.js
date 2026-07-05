const router = require('express').Router();
const ctrl = require("../controllers/productController");
const {
  verifyJWT,
  requireMerchant,
  requireOwnership,
} = require("../middleware/auth.middleware");
const { productValidator } = require("../middleware/validate.middleware");
const { uploadImages } = require("../middleware/upload.middleware");
const Product = require("../models/Product");
// ── Public Routes ─────────────────────────────────────────────────────
router.get("/", ctrl.getAllProducts); // GET /api/products?category=X&search=Y
router.get("/:id", ctrl.getProduct); // GET /api/products/:id


// ── Merchant Routes ───────────────────────────────────────────────────
// GET own products
router.get(
  "/merchant/my-products",
  verifyJWT,
  requireMerchant,
  ctrl.getMerchantProducts,
);

// CREATE product
router.post(
  "/",
  verifyJWT,
  requireMerchant,
  uploadImages, // multer + cloudinary
  productValidator, // validate fields
  ctrl.createProduct,
);

// UPDATE product (must own it)
router.put(
  "/:id",
  verifyJWT,
  requireMerchant,
  requireOwnership(Product),
  uploadImages,
  productValidator,
  ctrl.updateProduct,
);

// DELETE product (soft delete, must own it)
router.delete(
  "/:id",
  verifyJWT,
  requireMerchant,
  requireOwnership(Product),
  ctrl.deleteProduct,
);

// DELETE single image from product
router.delete(
  "/:id/image",
  verifyJWT,
  requireMerchant,
  requireOwnership(Product),
  ctrl.deleteProductImage,
);

const reviewRoutes = require("./review.routes");
router.use("/:id/reviews", reviewRoutes);

module.exports = router;
