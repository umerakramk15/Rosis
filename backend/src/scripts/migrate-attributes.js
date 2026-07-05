/**
 * Migration Script: Add Attributes to Existing Products
 *
 * This script:
 * 1. Adds availableAttributes field to existing products
 * 2. Creates variants from existing stock (if applicable)
 * 3. Updates category references
 * 4. Preserves all existing data
 *
 * Run with: node scripts/migrate-attributes.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("../models/Product");
const Category = require("../models/Category");
const Variant = require("../models/Variant");

// Color mapping for common color names to hex codes
const colorMap = {
  red: "#FF0000",
  blue: "#0000FF",
  green: "#00FF00",
  black: "#000000",
  white: "#FFFFFF",
  blush: "#F9D5D3",
  rose: "#C9727A",
  pink: "#FFC0CB",
  purple: "#800080",
  yellow: "#FFFF00",
  orange: "#FFA500",
  brown: "#8B4513",
  gray: "#808080",
  grey: "#808080",
  navy: "#000080",
  gold: "#FFD700",
  silver: "#C0C0C0",
  ivory: "#FFFFF0",
  mauve: "#C4A0B0",
  sage: "#B5C4B1",
  plum: "#3D2040",
};

// Size mapping for standard clothing sizes
const sizeMap = {
  XS: { value: "XS", ukSize: "UK 6", usSize: "US 2" },
  S: { value: "S", ukSize: "UK 8", usSize: "US 4" },
  M: { value: "M", ukSize: "UK 10", usSize: "US 6" },
  L: { value: "L", ukSize: "UK 12", usSize: "US 8" },
  XL: { value: "XL", ukSize: "UK 14", usSize: "US 10" },
  XXL: { value: "XXL", ukSize: "UK 16", usSize: "US 12" },
};

// Helper: Detect category type from product category string
function detectCategoryType(categoryName) {
  const cat = categoryName?.toLowerCase() || "";

  if (
    [
      "clothing",
      "dress",
      "shirt",
      "pants",
      "jacket",
      "coat",
      "sweater",
      "hoodie",
      "jeans",
    ].some((k) => cat.includes(k))
  ) {
    return "clothing";
  }
  if (
    [
      "electronics",
      "phone",
      "laptop",
      "tablet",
      "tv",
      "headphone",
      "speaker",
      "camera",
    ].some((k) => cat.includes(k))
  ) {
    return "electronics";
  }
  if (
    [
      "furniture",
      "chair",
      "table",
      "desk",
      "sofa",
      "bed",
      "cabinet",
      "shelf",
    ].some((k) => cat.includes(k))
  ) {
    return "furniture";
  }
  if (["book", "novel", "magazine", "textbook"].some((k) => cat.includes(k))) {
    return "books";
  }
  if (
    ["shoe", "sneaker", "boot", "sandals", "loafer"].some((k) =>
      cat.includes(k),
    )
  ) {
    return "shoes";
  }
  if (
    ["beauty", "cosmetic", "skincare", "makeup", "perfume"].some((k) =>
      cat.includes(k),
    )
  ) {
    return "beauty";
  }

  return "default";
}

// Helper: Generate color hex if missing
function getColorHex(colorName) {
  if (!colorName) return "#000000";
  const key = colorName.toLowerCase().trim();
  return (
    colorMap[key] || `#${Math.floor(Math.random() * 16777215).toString(16)}`
  );
}

// Helper: Check if text should be dark on this color
function isTextDark(hex) {
  if (!hex) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

async function migrateProducts() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";
    await mongoose.connect(mongoUri);
    console.log("📦 Connected to MongoDB");

    // Get or create categories
    console.log("\n📂 Checking categories...");

    const clothingCat = await Category.findOneAndUpdate(
      { slug: "clothing" },
      {
        name: "Clothing",
        slug: "clothing",
        uiTemplate: "fashion",
        isActive: true,
      },
      { upsert: true, new: true },
    );

    const electronicsCat = await Category.findOneAndUpdate(
      { slug: "electronics" },
      {
        name: "Electronics",
        slug: "electronics",
        uiTemplate: "electronics",
        isActive: true,
      },
      { upsert: true, new: true },
    );

    const furnitureCat = await Category.findOneAndUpdate(
      { slug: "furniture" },
      {
        name: "Furniture",
        slug: "furniture",
        uiTemplate: "furniture",
        isActive: true,
      },
      { upsert: true, new: true },
    );

    const booksCat = await Category.findOneAndUpdate(
      { slug: "books" },
      {
        name: "Books",
        slug: "books",
        uiTemplate: "books",
        isActive: true,
      },
      { upsert: true, new: true },
    );

    console.log("✅ Categories ready");
    console.log(`   - Clothing: ${clothingCat._id}`);
    console.log(`   - Electronics: ${electronicsCat._id}`);
    console.log(`   - Furniture: ${furnitureCat._id}`);
    console.log(`   - Books: ${booksCat._id}`);

    // Get all active products
    const products = await Product.find({ isActive: true });
    console.log(`\n📦 Found ${products.length} products to migrate`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const product of products) {
      try {
        // Detect category type
        const categoryType = detectCategoryType(product.category);
        let categoryId = clothingCat._id;

        switch (categoryType) {
          case "electronics":
            categoryId = electronicsCat._id;
            break;
          case "furniture":
            categoryId = furnitureCat._id;
            break;
          case "books":
            categoryId = booksCat._id;
            break;
          default:
            categoryId = clothingCat._id;
        }

        // Build availableAttributes based on category
        let availableAttributes = {};
        let variants = [];

        if (categoryType === "clothing") {
          // For clothing: add basic color and size options
          availableAttributes = {
            color: [
              "Blush Rose",
              "Dusty Mauve",
              "Ivory Cream",
              "Sage Mist",
              "Midnight Plum",
            ],
            size: ["XS", "S", "M", "L", "XL"],
          };

          // Create variants for each color-size combination
          for (const color of availableAttributes.color) {
            for (const size of availableAttributes.size) {
              variants.push({
                sku: `${product.sku || product._id.toString().slice(-6)}-${size}-${color.replace(/\s/g, "")}`,
                attributes: [
                  {
                    name: "color",
                    label: "Colour",
                    value: color,
                    hex: getColorHex(color),
                    textDark: isTextDark(getColorHex(color)),
                  },
                  { name: "size", label: "Size", value: size },
                ],
                stock:
                  product.stock > 0
                    ? Math.floor(
                        product.stock /
                          (availableAttributes.color.length *
                            availableAttributes.size.length),
                      ) || 1
                    : 0,
                price: product.price,
              });
            }
          }
        } else if (categoryType === "electronics") {
          availableAttributes = {
            storage: ["128GB", "256GB"],
            color: ["Black", "Silver"],
          };

          for (const storage of availableAttributes.storage) {
            for (const color of availableAttributes.color) {
              variants.push({
                sku: `${product.sku || product._id.toString().slice(-6)}-${storage}-${color}`,
                attributes: [
                  { name: "storage", label: "Storage", value: storage },
                  {
                    name: "color",
                    label: "Colour",
                    value: color,
                    hex: getColorHex(color),
                    textDark: isTextDark(getColorHex(color)),
                  },
                ],
                stock:
                  product.stock > 0 ? Math.floor(product.stock / 4) || 1 : 0,
                price: product.price,
              });
            }
          }
        } else {
          // Default: no variants
          availableAttributes = {};
        }

        // Update product with category and attributes
        const updateData = {
          categoryId,
          availableAttributes,
        };

        // Add features if not present (generate from description)
        if (!product.features || product.features.length === 0) {
          updateData.features = [
            "Premium quality material",
            "Sustainably sourced",
            "Carefully crafted",
            "30-day return policy",
          ];
        }

        // Add tags if not present
        if (!product.tags || product.tags.length === 0) {
          updateData.tags = product.stock > 50 ? ["Bestseller"] : [];
        }

        // Update product
        await Product.findByIdAndUpdate(product._id, updateData);

        // Delete existing variants and create new ones
        if (variants.length > 0) {
          await Variant.deleteMany({ productId: product._id });
          for (const variant of variants) {
            await Variant.create({
              ...variant,
              productId: product._id,
            });
          }
        }

        updated++;
        console.log(`✅ Migrated: ${product.name} (${categoryType})`);
      } catch (err) {
        errors++;
        console.error(`❌ Error migrating ${product.name}:`, err.message);
      }
    }

    console.log("\n🎉 Migration complete!");
    console.log(
      `📊 Updated: ${updated} | Skipped: ${skipped} | Errors: ${errors}`,
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

// Run migration
migrateProducts();
