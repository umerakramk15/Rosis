const router = require("express").Router();
const ctrl = require("../controllers/categoryController");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate.middleware");
const { verifyJWT, requireMerchant } = require("../middleware/auth.middleware");

// ── Validation Rules ───────────────────────────────────────────────────
const categoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
  body("slug")
    .optional()
    .trim()
    .isSlug()
    .withMessage("Slug must be URL-friendly"),
  body("description").optional().trim().isLength({ max: 500 }),
  body("uiTemplate")
    .optional()
    .isIn(["fashion", "electronics", "furniture", "books", "default"]),
  validate,
];

const attributeValidator = [
  body("name").trim().notEmpty().withMessage("Attribute name is required"),
  body("label").trim().notEmpty().withMessage("Attribute label is required"),
  body("type")
    .isIn(["color", "size", "text", "number", "select", "radio"])
    .withMessage("Invalid attribute type"),
  body("required").optional().isBoolean(),
  body("order").optional().isInt({ min: 0 }),
  validate,
];

// ── PUBLIC ROUTES (no auth required) ───────────────────────────────────

// Get all categories
router.get("/", ctrl.getAllCategories);

// Get single category by ID or slug
router.get("/:id", ctrl.getCategory);

// Get category with its products (paginated)
router.get("/:id/products", ctrl.getCategoryWithProducts);

// Get category attributes only (for frontend dynamic forms)
router.get("/:id/attributes", ctrl.getCategoryAttributes);

router.post("/", verifyJWT, requireMerchant, categoryValidator, ctrl.createCategory);
router.put("/:id", verifyJWT, requireMerchant, categoryValidator, ctrl.updateCategory);
router.delete("/:id", verifyJWT, requireMerchant, ctrl.deleteCategory);
router.get("/my/categories", verifyJWT, requireMerchant, ctrl.getMyCategories);

// ── ADMIN ROUTES (commented out - requireAdmin not defined yet) ─────────
// router.post("/", categoryValidator, ctrl.createCategory);
// router.put("/:id", categoryValidator, ctrl.updateCategory);
// router.delete("/:id", ctrl.deleteCategory);
// router.delete("/:id/permanent", ctrl.hardDeleteCategory);
// router.post("/:id/attributes", attributeValidator, ctrl.addAttribute);
// router.delete("/:id/attributes/:attributeName", ctrl.removeAttribute);
// router.post("/initialize", ctrl.initializeCategories);

module.exports = router;
