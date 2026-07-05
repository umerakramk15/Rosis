const Product = require("../models/Product");
const Category = require("../models/Category");
const Variant = require("../models/Variant");
const asyncWrapper = require("../utils/asyncWrapper");
const { sendSuccess, sendError } = require("../utils/responseHelper");
const aiService = require("../services/aiService");
const cloudinary = require("../config/cloudinaryConfig");

// ── GET ALL PRODUCTS (public) with attribute filtering ─────────────────
exports.getAllProducts = asyncWrapper(async (req, res) => {
  const {
    category,
    categoryId,
    minPrice,
    maxPrice,
    search,
    sortBy = "createdAt",
    order = "desc",
    page = 1,
    limit = 20,
    // Dynamic attribute filters
    color,
    size,
    storage,
    material,
    ...attributeFilters
  } = req.query;

  // Build filter
  const filter = { isActive: true };

  // Category filtering
  if (categoryId) filter.categoryId = categoryId;
  if (category) filter.category = new RegExp(category, "i");

  // Price filtering
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Text search
  if (search) filter.$text = { $search: search };

  // ── NEW: Attribute filtering (using availableAttributes) ─────────────
  // Example: ?color=Blush%20Rose&size=M
  const attributeFiltersList = { color, size, storage, material };
  Object.keys(attributeFiltersList).forEach((attrName) => {
    const attrValue = attributeFiltersList[attrName];
    if (attrValue) {
      filter[`availableAttributes.${attrName}`] = attrValue;
    }
  });

  // Pagination
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Sort options
  const allowedSorts = [
    "price",
    "createdAt",
    "ratings.average",
    "name",
    "stock",
  ];
  const sortField = allowedSorts.includes(sortBy) ? sortBy : "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .populate("categoryId", "name uiTemplate attributes")
      .select("-forecastData -returnRisk -pricingReasoning"),
    Product.countDocuments(filter),
  ]);

  sendSuccess(res, 200, "Products fetched", {
    products,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

// ── GET SINGLE PRODUCT (public) with variants ─────────────────────────
exports.getProduct = asyncWrapper(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isActive: true,
  })
    .populate("merchantId", "name email")
    .populate("categoryId", "name uiTemplate attributes filterableAttributes");

  if (!product) return sendError(res, 404, "Product not found.");

  // ── NEW: Fetch variants if they exist ────────────────────────────────
  const variants = await Variant.find({
    productId: product._id,
    isActive: true,
  });

  // Build response with variants
  const productData = product.toObject();
  if (variants.length > 0) {
    productData.variants = variants;
    productData.hasVariants = true;
    productData.totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  } else {
    productData.hasVariants = false;
    productData.totalStock = product.stock;
  }

  sendSuccess(res, 200, "Product fetched", productData);
});

// ── CREATE PRODUCT (merchant only) with attributes & variants ─────────
exports.createProduct = asyncWrapper(async (req, res) => {
  const {
    name,
    description,
    categoryId,
    category,
    price,
    originalPrice,
    stock,
    features,
    tags,
    brand,
    sku,
    sizeGuide,
    availableAttributes,
  } = req.body;

  const images = req.uploadedImages || [];

  // ── NEW: Validate category exists ────────────────────────────────────
  let categoryDoc = null;
  if (categoryId) {
    categoryDoc = await Category.findById(categoryId);
  } else if (category) {
    categoryDoc = await Category.findOne({ slug: category.toLowerCase() });
  }

  if (!categoryDoc) {
    return sendError(res, 400, "Valid category is required");
  }

  // Parse availableAttributes from JSON string if needed
  let parsedAttributes = {};
  if (availableAttributes) {
    parsedAttributes =
      typeof availableAttributes === "string"
        ? JSON.parse(availableAttributes)
        : availableAttributes;
  }

  // Parse features from JSON string if needed
  let parsedFeatures = [];
  if (features) {
    parsedFeatures =
      typeof features === "string" ? JSON.parse(features) : features;
  }

  // Parse tags from JSON string if needed
  let parsedTags = [];
  if (tags) {
    parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
  }

  const product = await Product.create({
    merchantId: req.user._id,
    name,
    description,
    categoryId: categoryDoc._id,
    category: categoryDoc.name,
    price: parseFloat(price),
    originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
    stock: parseInt(stock) || 0,
    images,
    features: parsedFeatures,
    tags: parsedTags,
    brand: brand || "",
    sku: sku || "",
    sizeGuide: sizeGuide ? new Map(Object.entries(sizeGuide)) : undefined,
    availableAttributes: parsedAttributes,
  });

  // ── NEW: Create variants if provided ─────────────────────────────────
  let variants = [];
  if (req.body.variants) {
    const variantsData =
      typeof req.body.variants === "string"
        ? JSON.parse(req.body.variants)
        : req.body.variants;

    for (const v of variantsData) {
      const variant = await Variant.create({
        productId: product._id,
        sku: v.sku,
        attributes: v.attributes,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        stock: v.stock,
        images: v.images || [],
      });
      variants.push(variant);
    }
  }

  // Trigger AI return risk prediction — async
  aiService
    .predictReturnRisk(product)
    .then(async (risk) => {
      await Product.findByIdAndUpdate(product._id, { returnRisk: risk });
    })
    .catch((err) =>
      console.error("Return risk prediction failed:", err.message),
    );

  sendSuccess(res, 201, "Product created successfully", {
    product,
    variants: variants.length > 0 ? variants : undefined,
  });
});

// ── UPDATE PRODUCT (merchant only) ────────────────────────────────────
exports.updateProduct = asyncWrapper(async (req, res) => {
  const {
    name,
    description,
    categoryId,
    price,
    originalPrice,
    stock,
    features,
    tags,
    brand,
    sku,
    sizeGuide,
    availableAttributes,
    isActive,
  } = req.body;

  const updates = {
    name,
    description,
    brand,
    sku,
    isActive,
  };

  if (price !== undefined) updates.price = parseFloat(price);
  if (originalPrice !== undefined)
    updates.originalPrice = parseFloat(originalPrice);
  if (stock !== undefined) updates.stock = parseInt(stock);
  if (features !== undefined)
    updates.features =
      typeof features === "string" ? JSON.parse(features) : features;
  if (tags !== undefined)
    updates.tags = typeof tags === "string" ? JSON.parse(tags) : tags;
  if (sizeGuide !== undefined)
    updates.sizeGuide = new Map(Object.entries(sizeGuide));
  if (availableAttributes !== undefined) {
    updates.availableAttributes =
      typeof availableAttributes === "string"
        ? JSON.parse(availableAttributes)
        : availableAttributes;
  }

  // Update category if changed
  if (categoryId) {
    const categoryDoc = await Category.findById(categoryId);
    if (categoryDoc) {
      updates.categoryId = categoryDoc._id;
      updates.category = categoryDoc.name;
    }
  }

  // Add new images
  if (req.uploadedImages && req.uploadedImages.length > 0) {
    updates.$push = { images: { $each: req.uploadedImages } };
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!product) return sendError(res, 404, "Product not found");

  // ── NEW: Update variants if provided ─────────────────────────────────
  if (req.body.variants) {
    const variantsData =
      typeof req.body.variants === "string"
        ? JSON.parse(req.body.variants)
        : req.body.variants;

    // Delete old variants
    await Variant.deleteMany({ productId: product._id });

    // Create new variants
    for (const v of variantsData) {
      await Variant.create({
        productId: product._id,
        sku: v.sku,
        attributes: v.attributes,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        stock: v.stock,
        images: v.images || [],
      });
    }
  }

  // Re-run AI return risk
  aiService
    .predictReturnRisk(product)
    .then(async (risk) => {
      await Product.findByIdAndUpdate(product._id, { returnRisk: risk });
    })
    .catch((err) =>
      console.error("Return risk re-prediction failed:", err.message),
    );

  sendSuccess(res, 200, "Product updated successfully", product);
});

// ── DELETE PRODUCT (soft delete) ──────────────────────────────────────
exports.deleteProduct = asyncWrapper(async (req, res) => {
  // Also soft delete variants
  await Variant.updateMany({ productId: req.params.id }, { isActive: false });
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  sendSuccess(res, 200, "Product deleted successfully.");
});

// ── DELETE SINGLE IMAGE from product ─────────────────────────────────
exports.deleteProductImage = asyncWrapper(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) return sendError(res, 400, "Image publicId is required.");

  // Delete from Cloudinary
  await cloudinary.uploader.destroy(publicId);

  // Remove from product document
  await Product.findByIdAndUpdate(req.params.id, {
    $pull: { images: { publicId } },
  });

  sendSuccess(res, 200, "Image deleted successfully.");
});

// ── GET MERCHANT'S OWN PRODUCTS ───────────────────────────────────────
exports.getMerchantProducts = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;

  const filter = { merchantId: req.user._id, isActive: true };
  if (search) filter.$text = { $search: search };

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("categoryId", "name"),
    Product.countDocuments(filter),
  ]);

  sendSuccess(res, 200, "Merchant products fetched", {
    products,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

// ── NEW: GET PRODUCT VARIANTS ─────────────────────────────────────────
exports.getProductVariants = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const variants = await Variant.find({ productId: id, isActive: true });

  sendSuccess(res, 200, "Product variants fetched", variants);
});

// ── NEW: UPDATE VARIANT STOCK ─────────────────────────────────────────
exports.updateVariantStock = asyncWrapper(async (req, res) => {
  const { productId, variantId } = req.params;
  const { stock } = req.body;

  const variant = await Variant.findOne({ _id: variantId, productId });
  if (!variant) return sendError(res, 404, "Variant not found");

  variant.stock = stock;
  await variant.save();

  sendSuccess(res, 200, "Variant stock updated", variant);
});
