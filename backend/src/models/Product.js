const mongoose = require("mongoose");

const returnRiskSchema = new mongoose.Schema(
  {
    level: { type: String, enum: ["low", "medium", "high"], default: "low" },
    probability: { type: Number, min: 0, max: 1, default: 0 },
    topReason: { type: String, default: "" },
    lastCalculated: { type: Date, default: Date.now },
  },
  { _id: false },
);

const attributeValueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String, required: true },
    hex: { type: String },
    textDark: { type: Boolean, default: true },
    extraPrice: { type: Number, default: 0 },
  },
  { _id: false },
);

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, unique: true, sparse: true },
    attributes: [attributeValueSchema],
    price: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    images: [{ type: String }],
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    category: { type: String, required: true, trim: true },
    availableAttributes: { type: mongoose.Schema.Types.Mixed, default: {} },
    variants: [variantSchema],
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    suggestedPrice: { type: Number, min: 0 },
    pricingReasoning: { type: String },
    features: [{ type: String }],
    tags: [{ type: String }],
    brand: { type: String, trim: true },
    sku: { type: String, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [
      {
        url: { type: String },
        publicId: { type: String },
        color: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    sizeGuide: { type: Map, of: String },
    ratings: {
      average: { type: Number, min: 0, max: 5, default: 0 },
      count: { type: Number, default: 0 },
      breakdown: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 },
      },
    },
    returnRisk: returnRiskSchema,
    forecastData: { type: mongoose.Schema.Types.Mixed },
    forecastUpdatedAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// ONLY ONE INDEX SECTION
productSchema.index({ name: "text", description: "text", category: "text" });
productSchema.index({ merchantId: 1, isActive: 1 });
productSchema.index({ categoryId: 1, price: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ "variants.sku": 1 });

productSchema.virtual("totalStock").get(function () {
  if (this.variants && this.variants.length > 0) {
    return this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
  return this.stock;
});

productSchema.virtual("hasVariants").get(function () {
  return this.variants && this.variants.length > 0;
});

productSchema.methods.getVariant = function (attributeObj) {
  return this.variants.find((v) => {
    return v.attributes.every((attr) => attributeObj[attr.name] === attr.value);
  });
};

productSchema.methods.getAttributeOptions = function (attrName) {
  const options = new Set();
  this.variants.forEach((variant) => {
    const attr = variant.attributes.find((a) => a.name === attrName);
    if (attr) options.add(attr.value);
  });
  return Array.from(options);
};

module.exports = mongoose.model("Product", productSchema);
