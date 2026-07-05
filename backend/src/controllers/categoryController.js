const Category = require("../models/Category");
const Product = require("../models/Product");
const asyncWrapper = require("../utils/asyncWrapper");
const { sendSuccess, sendError } = require("../utils/responseHelper");

// ── GET ALL CATEGORIES (public) ─────────────────────────────────────────
exports.getAllCategories = asyncWrapper(async (req, res) => {
  const { includeInactive = false } = req.query;

  const filter = {};
  if (!includeInactive) filter.isActive = true;

  const categories = await Category.find(filter).sort({ name: 1 });

  sendSuccess(res, 200, "Categories fetched", categories);
});

// ── GET SINGLE CATEGORY (public) ────────────────────────────────────────
exports.getCategory = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findOne({
    $or: [{ _id: id }, { slug: id }],
    isActive: true,
  });

  if (!category) return sendError(res, 404, "Category not found");

  sendSuccess(res, 200, "Category fetched", category);
});

// ── GET CATEGORY WITH PRODUCTS (public) ─────────────────────────────────
exports.getCategoryWithProducts = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const {
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const category = await Category.findOne({
    $or: [{ _id: id }, { slug: id }],
    isActive: true,
  });

  if (!category) return sendError(res, 404, "Category not found");

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

  // Build filter
  const filter = {
    categoryId: category._id,
    isActive: true,
  };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .select("name price images ratings stock tags availableAttributes"),
    Product.countDocuments(filter),
  ]);

  sendSuccess(res, 200, "Category with products fetched", {
    category,
    products,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
});

// ── GET CATEGORY ATTRIBUTES (for frontend dynamic rendering) ────────────
exports.getCategoryAttributes = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findOne({
    $or: [{ _id: id }, { slug: id }],
    isActive: true,
  }).select("name uiTemplate attributes filterableAttributes");

  if (!category) return sendError(res, 404, "Category not found");

  sendSuccess(res, 200, "Category attributes fetched", {
    name: category.name,
    uiTemplate: category.uiTemplate,
    attributes: category.attributes || [],
    filterableAttributes: category.filterableAttributes || [],
  });
});

// ── CREATE CATEGORY (admin only) ────────────────────────────────────────
exports.createCategory = asyncWrapper(async (req, res) => {
  const {
    name,
    slug,
    description,
    icon,
    uiTemplate,
    attributes,
    filterableAttributes,
  } = req.body;

  const existing = await Category.findOne({ $or: [{ name }, { slug }] });
  if (existing) return sendError(res, 409, "Category already exists");

  const category = await Category.create({
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
    description,
    icon,
    uiTemplate: uiTemplate || "default",
    attributes: attributes || [],
    filterableAttributes: filterableAttributes || [],
    merchantId: req.user._id, // ← ADD THIS
    isActive: true,
  });

  sendSuccess(res, 201, "Category created successfully", category);
});

// ── UPDATE CATEGORY (admin only) ────────────────────────────────────────
exports.updateCategory = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    slug,
    description,
    icon,
    uiTemplate,
    attributes,
    filterableAttributes,
    isActive,
  } = req.body;

  const category = await Category.findById(id);
  if (!category) return sendError(res, 404, "Category not found");

  // Update fields
  if (name) category.name = name;
  if (slug) category.slug = slug;
  if (description !== undefined) category.description = description;
  if (icon !== undefined) category.icon = icon;
  if (uiTemplate) category.uiTemplate = uiTemplate;
  if (attributes) category.attributes = attributes;
  if (filterableAttributes)
    category.filterableAttributes = filterableAttributes;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  sendSuccess(res, 200, "Category updated successfully", category);
});

exports.getMyCategories = asyncWrapper(async (req, res) => {
  const categories = await Category.find({
    merchantId: req.user._id,
    isActive: true,
  }).sort({ name: 1 });

  sendSuccess(res, 200, "My categories fetched", categories);
});

// ── DELETE CATEGORY (soft delete, admin only) ───────────────────────────
exports.deleteCategory = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) return sendError(res, 404, "Category not found");

  // Check if any products use this category
  const productCount = await Product.countDocuments({
    categoryId: id,
    isActive: true,
  });
  if (productCount > 0) {
    return sendError(
      res,
      400,
      `Cannot delete category with ${productCount} active products. Reassign products first.`,
    );
  }

  // Soft delete
  category.isActive = false;
  await category.save();

  sendSuccess(res, 200, "Category deleted successfully");
});

// ── HARD DELETE CATEGORY (admin only, use with caution) ─────────────────
exports.hardDeleteCategory = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) return sendError(res, 404, "Category not found");

  // Check if any products use this category (including inactive)
  const productCount = await Product.countDocuments({ categoryId: id });
  if (productCount > 0) {
    return sendError(
      res,
      400,
      `Cannot delete category with ${productCount} products. Reassign or delete products first.`,
    );
  }

  await Category.findByIdAndDelete(id);

  sendSuccess(res, 200, "Category permanently deleted");
});

// ── ADD ATTRIBUTE TO CATEGORY (admin only) ──────────────────────────────
exports.addAttribute = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { name, label, type, required, options, sizeGuide, order } = req.body;

  if (!name || !label || !type) {
    return sendError(res, 400, "name, label, and type are required");
  }

  const category = await Category.findById(id);
  if (!category) return sendError(res, 404, "Category not found");

  // Check if attribute already exists
  if (category.attributes.some((attr) => attr.name === name)) {
    return sendError(
      res,
      409,
      `Attribute '${name}' already exists in this category`,
    );
  }

  category.attributes.push({
    name,
    label,
    type,
    required: required || false,
    options: options || [],
    sizeGuide: sizeGuide || new Map(),
    order: order || category.attributes.length,
  });

  await category.save();

  sendSuccess(res, 201, "Attribute added successfully", category);
});

// ── REMOVE ATTRIBUTE FROM CATEGORY (admin only) ─────────────────────────
exports.removeAttribute = asyncWrapper(async (req, res) => {
  const { id, attributeName } = req.params;

  const category = await Category.findById(id);
  if (!category) return sendError(res, 404, "Category not found");

  category.attributes = category.attributes.filter(
    (attr) => attr.name !== attributeName,
  );
  category.filterableAttributes = category.filterableAttributes.filter(
    (attr) => attr !== attributeName,
  );

  await category.save();

  sendSuccess(res, 200, "Attribute removed successfully", category);
});

// ── INITIALIZE DEFAULT CATEGORIES (run once) ────────────────────────────
exports.initializeCategories = asyncWrapper(async (req, res) => {
  await Category.initializeDefaultCategories();
  sendSuccess(res, 200, "Default categories initialized");
});
