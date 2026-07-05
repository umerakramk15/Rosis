const mongoose = require("mongoose");

const attributeOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
    hex: { type: String },
    textDark: { type: Boolean, default: true },
    extraPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
  },
  { _id: false },
);

const attributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["color", "size", "text", "number", "select", "radio"],
      required: true,
    },
    required: { type: Boolean, default: false },
    options: [attributeOptionSchema],
    sizeGuide: { type: Map, of: String },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
    icon: { type: String },
    uiTemplate: {
      type: String,
      enum: ["fashion", "electronics", "furniture", "books", "default"],
      default: "default",
    },
    attributes: [attributeSchema],
    filterableAttributes: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// ONLY ONE INDEX SECTION
categorySchema.index({ slug: 1 });
categorySchema.index({ name: 1 });

categorySchema.statics.initializeDefaultCategories = async function () {
  const count = await this.countDocuments();
  if (count > 0) return;

  const defaultCategories = [
    {
      name: "Clothing",
      slug: "clothing",
      uiTemplate: "fashion",
      attributes: [
        {
          name: "color",
          label: "Colour",
          type: "color",
          required: true,
          order: 1,
          options: [],
        },
        {
          name: "size",
          label: "Size",
          type: "size",
          required: true,
          order: 2,
          options: [
            { name: "XS", value: "XS" },
            { name: "S", value: "S" },
            { name: "M", value: "M" },
            { name: "L", value: "L" },
            { name: "XL", value: "XL" },
          ],
          sizeGuide: new Map([
            ["XS", "UK 6"],
            ["S", "UK 8"],
            ["M", "UK 10"],
            ["L", "UK 12"],
            ["XL", "UK 14"],
          ]),
        },
      ],
      filterableAttributes: ["color", "size"],
    },
    {
      name: "Electronics",
      slug: "electronics",
      uiTemplate: "electronics",
      attributes: [
        {
          name: "storage",
          label: "Storage",
          type: "select",
          required: false,
          order: 1,
          options: [
            { name: "64GB", value: "64" },
            { name: "128GB", value: "128" },
            { name: "256GB", value: "256" },
            { name: "512GB", value: "512" },
          ],
        },
        {
          name: "ram",
          label: "RAM",
          type: "select",
          required: false,
          order: 2,
          options: [
            { name: "4GB", value: "4" },
            { name: "8GB", value: "8" },
            { name: "16GB", value: "16" },
          ],
        },
        {
          name: "color",
          label: "Colour",
          type: "color",
          required: false,
          order: 3,
          options: [
            { name: "Black", value: "#000000", textDark: false },
            { name: "White", value: "#FFFFFF", textDark: true },
            { name: "Silver", value: "#C0C0C0", textDark: true },
            { name: "Gold", value: "#FFD700", textDark: false },
          ],
        },
      ],
      filterableAttributes: ["storage", "ram", "color"],
    },
    {
      name: "Furniture",
      slug: "furniture",
      uiTemplate: "furniture",
      attributes: [
        {
          name: "material",
          label: "Material",
          type: "select",
          required: true,
          order: 1,
          options: [
            { name: "Wood", value: "wood" },
            { name: "Metal", value: "metal" },
            { name: "Plastic", value: "plastic" },
            { name: "Glass", value: "glass" },
          ],
        },
        {
          name: "dimensions",
          label: "Dimensions",
          type: "text",
          required: false,
          order: 2,
          options: [],
        },
        {
          name: "color",
          label: "Colour",
          type: "color",
          required: false,
          order: 3,
          options: [
            { name: "Oak", value: "#8B5A2B", textDark: false },
            { name: "Walnut", value: "#5C4033", textDark: false },
            { name: "White", value: "#FFFFFF", textDark: true },
            { name: "Black", value: "#000000", textDark: false },
          ],
        },
      ],
      filterableAttributes: ["material", "color"],
    },
    {
      name: "Books",
      slug: "books",
      uiTemplate: "books",
      attributes: [
        {
          name: "format",
          label: "Format",
          type: "select",
          required: true,
          order: 1,
          options: [
            { name: "Hardcover", value: "hardcover" },
            { name: "Paperback", value: "paperback" },
            { name: "eBook", value: "ebook" },
            { name: "Audiobook", value: "audiobook" },
          ],
        },
        {
          name: "language",
          label: "Language",
          type: "select",
          required: false,
          order: 2,
          options: [
            { name: "English", value: "en" },
            { name: "Urdu", value: "ur" },
            { name: "Arabic", value: "ar" },
          ],
        },
      ],
      filterableAttributes: ["format", "language"],
      merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null, // null = system category, non-null = merchant custom
      },
    },
  ];

  await this.insertMany(defaultCategories);
  console.log("✅ Default categories seeded");
};

module.exports = mongoose.model("Category", categorySchema);
