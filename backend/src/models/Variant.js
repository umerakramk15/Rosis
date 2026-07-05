const mongoose = require("mongoose");

const variantAttributeSchema = new mongoose.Schema(
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
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: { type: String, unique: true, sparse: true, trim: true },
    attributes: [variantAttributeSchema],
    price: { type: Number, min: 0, default: null },
    compareAtPrice: { type: Number, min: 0, default: null },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ url: String, publicId: String }],
    weight: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// ONLY ONE INDEX SECTION - NO DUPLICATES
variantSchema.index({ productId: 1, sku: 1 });
variantSchema.index({ sku: 1 });
variantSchema.index(
  { productId: 1, "attributes.name": 1, "attributes.value": 1 },
  {
    unique: true,
    partialFilterExpression: { "attributes.0": { $exists: true } },
  },
);

variantSchema.virtual("displayName").get(function () {
  return this.attributes.map((attr) => attr.value).join(" / ");
});

variantSchema.methods.getAttributeValue = function (attrName) {
  const attr = this.attributes.find((a) => a.name === attrName);
  return attr ? attr.value : null;
};

variantSchema.methods.hasAttribute = function (attrName, attrValue) {
  return this.attributes.some(
    (a) => a.name === attrName && a.value === attrValue,
  );
};

variantSchema.statics.getByProductId = async function (productId) {
  return this.find({ productId, isActive: true }).sort({ createdAt: 1 });
};

variantSchema.statics.getAvailableOptions = async function (
  productId,
  attrName,
) {
  const variants = await this.find({ productId, isActive: true });
  const options = new Set();
  variants.forEach((variant) => {
    const attr = variant.attributes.find((a) => a.name === attrName);
    if (attr) options.add(attr.value);
  });
  return Array.from(options);
};

variantSchema.statics.getStock = async function (productId, attributes) {
  const variant = await this.findOne({
    productId,
    isActive: true,
    attributes: {
      $size: attributes.length,
      $all: attributes.map((a) => ({ $elemMatch: a })),
    },
  });
  return variant ? variant.stock : 0;
};

variantSchema.pre("save", async function (next) {
  if (!this.sku) {
    const product = await mongoose
      .model("Product")
      .findById(this.productId)
      .select("sku");
    const attrHash = this.attributes
      .map((a) => `${a.name}=${a.value}`)
      .join("|");
    const hash = require("crypto")
      .createHash("md5")
      .update(attrHash)
      .digest("hex")
      .substring(0, 6);
    this.sku = `${product?.sku || "VAR"}-${hash.toUpperCase()}`;
  }
  next();
});

variantSchema.post("save", async function () {
  const Product = require("./Product");
  const Variant = mongoose.model("Variant");

  const variants = await Variant.find({
    productId: this.productId,
    isActive: true,
  });
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  const availableAttributes = {};
  variants.forEach((variant) => {
    variant.attributes.forEach((attr) => {
      if (!availableAttributes[attr.name]) {
        availableAttributes[attr.name] = new Set();
      }
      availableAttributes[attr.name].add(attr.value);
    });
  });

  const availableAttributesArray = {};
  Object.keys(availableAttributes).forEach((key) => {
    availableAttributesArray[key] = Array.from(availableAttributes[key]);
  });

  await Product.findByIdAndUpdate(this.productId, {
    stock: totalStock,
    availableAttributes: availableAttributesArray,
    hasVariants: true,
  });
});

variantSchema.post("remove", async function () {
  const Product = require("./Product");
  const Variant = mongoose.model("Variant");

  const variants = await Variant.find({
    productId: this.productId,
    isActive: true,
  });

  if (variants.length === 0) {
    await Product.findByIdAndUpdate(this.productId, {
      stock: 0,
      availableAttributes: {},
      hasVariants: false,
    });
  } else {
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    await Product.findByIdAndUpdate(this.productId, {
      stock: totalStock,
    });
  }
});

module.exports = mongoose.model("Variant", variantSchema);
