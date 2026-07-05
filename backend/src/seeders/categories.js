/**
 * Seed Script: Preload Categories with Attribute Templates
 * 
 * Run with: node seed/categories.js
 * Or use: npm run seed:categories
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import Category model (will be created after this file exists)
const Category = require('../models/Category');

const categories = [
  // ── FASHION / CLOTHING ──────────────────────────────────────────────
  {
    name: "Clothing",
    slug: "clothing",
    description: "Fashion apparel including dresses, shirts, pants, and outerwear",
    icon: "👗",
    uiTemplate: "fashion",
    filterableAttributes: ["color", "size", "material"],
    attributes: [
      {
        name: "color",
        label: "Colour",
        type: "color",
        required: true,
        order: 1,
        options: []  // Merchant will add specific colors per product
      },
      {
        name: "size",
        label: "Size",
        type: "size",
        required: true,
        order: 2,
        options: [
          { name: "XS", value: "XS", extraPrice: 0 },
          { name: "S", value: "S", extraPrice: 0 },
          { name: "M", value: "M", extraPrice: 0 },
          { name: "L", value: "L", extraPrice: 0 },
          { name: "XL", value: "XL", extraPrice: 0 },
          { name: "XXL", value: "XXL", extraPrice: 0 }
        ],
        sizeGuide: new Map([
          ["XS", "UK 6 / US 2"],
          ["S", "UK 8 / US 4"],
          ["M", "UK 10 / US 6"],
          ["L", "UK 12 / US 8"],
          ["XL", "UK 14 / US 10"],
          ["XXL", "UK 16 / US 12"]
        ])
      },
      {
        name: "material",
        label: "Material",
        type: "select",
        required: false,
        order: 3,
        options: [
          { name: "Cotton", value: "cotton" },
          { name: "Linen", value: "linen" },
          { name: "Wool", value: "wool" },
          { name: "Silk", value: "silk" },
          { name: "Polyester", value: "polyester" }
        ]
      }
    ]
  },
  
  // ── ELECTRONICS ──────────────────────────────────────────────────────
  {
    name: "Electronics",
    slug: "electronics",
    description: "Gadgets, devices, and tech accessories",
    icon: "📱",
    uiTemplate: "electronics",
    filterableAttributes: ["brand", "storage", "ram", "color"],
    attributes: [
      {
        name: "brand",
        label: "Brand",
        type: "select",
        required: false,
        order: 1,
        options: [
          { name: "Apple", value: "apple" },
          { name: "Samsung", value: "samsung" },
          { name: "Google", value: "google" },
          { name: "Xiaomi", value: "xiaomi" },
          { name: "OnePlus", value: "oneplus" }
        ]
      },
      {
        name: "storage",
        label: "Storage",
        type: "select",
        required: false,
        order: 2,
        options: [
          { name: "64GB", value: "64", extraPrice: 0 },
          { name: "128GB", value: "128", extraPrice: 50 },
          { name: "256GB", value: "256", extraPrice: 100 },
          { name: "512GB", value: "512", extraPrice: 200 },
          { name: "1TB", value: "1024", extraPrice: 300 }
        ]
      },
      {
        name: "ram",
        label: "RAM",
        type: "select",
        required: false,
        order: 3,
        options: [
          { name: "4GB", value: "4", extraPrice: 0 },
          { name: "6GB", value: "6", extraPrice: 30 },
          { name: "8GB", value: "8", extraPrice: 60 },
          { name: "12GB", value: "12", extraPrice: 100 },
          { name: "16GB", value: "16", extraPrice: 150 }
        ]
      },
      {
        name: "color",
        label: "Colour",
        type: "color",
        required: false,
        order: 4,
        options: [
          { name: "Black", value: "#000000", textDark: false },
          { name: "White", value: "#FFFFFF", textDark: true },
          { name: "Silver", value: "#C0C0C0", textDark: true },
          { name: "Gold", value: "#FFD700", textDark: false },
          { name: "Midnight Blue", value: "#191970", textDark: false }
        ]
      }
    ]
  },
  
  // ── FURNITURE ────────────────────────────────────────────────────────
  {
    name: "Furniture",
    slug: "furniture",
    description: "Home and office furniture",
    icon: "🪑",
    uiTemplate: "furniture",
    filterableAttributes: ["material", "color", "type"],
    attributes: [
      {
        name: "material",
        label: "Material",
        type: "select",
        required: true,
        order: 1,
        options: [
          { name: "Solid Wood", value: "solid-wood" },
          { name: "Plywood", value: "plywood" },
          { name: "Metal", value: "metal" },
          { name: "Glass", value: "glass" },
          { name: "Plastic", value: "plastic" }
        ]
      },
      {
        name: "color",
        label: "Colour",
        type: "color",
        required: false,
        order: 2,
        options: [
          { name: "Oak", value: "#8B5A2B", textDark: false },
          { name: "Walnut", value: "#5C4033", textDark: false },
          { name: "White", value: "#FFFFFF", textDark: true },
          { name: "Black", value: "#000000", textDark: false },
          { name: "Gray", value: "#808080", textDark: false }
        ]
      },
      {
        name: "dimensions",
        label: "Dimensions (W x D x H)",
        type: "text",
        required: false,
        order: 3,
        options: []
      }
    ]
  },
  
  // ── BOOKS ────────────────────────────────────────────────────────────
  {
    name: "Books",
    slug: "books",
    description: "Books, novels, and educational material",
    icon: "📚",
    uiTemplate: "books",
    filterableAttributes: ["format", "language", "genre"],
    attributes: [
      {
        name: "format",
        label: "Format",
        type: "select",
        required: true,
        order: 1,
        options: [
          { name: "Hardcover", value: "hardcover", extraPrice: 15 },
          { name: "Paperback", value: "paperback", extraPrice: 0 },
          { name: "eBook", value: "ebook", extraPrice: -5 },
          { name: "Audiobook", value: "audiobook", extraPrice: -10 }
        ]
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
          { name: "French", value: "fr" },
          { name: "Spanish", value: "es" }
        ]
      },
      {
        name: "genre",
        label: "Genre",
        type: "select",
        required: false,
        order: 3,
        options: [
          { name: "Fiction", value: "fiction" },
          { name: "Non-Fiction", value: "non-fiction" },
          { name: "Mystery", value: "mystery" },
          { name: "Romance", value: "romance" },
          { name: "Science Fiction", value: "sci-fi" },
          { name: "Biography", value: "biography" }
        ]
      }
    ]
  },
  
  // ── SHOES / FOOTWEAR ─────────────────────────────────────────────────
  {
    name: "Shoes",
    slug: "shoes",
    description: "Footwear for men, women, and kids",
    icon: "👟",
    uiTemplate: "fashion",
    filterableAttributes: ["color", "size", "brand"],
    attributes: [
      {
        name: "color",
        label: "Colour",
        type: "color",
        required: true,
        order: 1,
        options: []
      },
      {
        name: "size",
        label: "Size (US)",
        type: "size",
        required: true,
        order: 2,
        options: [
          { name: "5", value: "5" },
          { name: "6", value: "6" },
          { name: "7", value: "7" },
          { name: "8", value: "8" },
          { name: "9", value: "9" },
          { name: "10", value: "10" },
          { name: "11", value: "11" },
          { name: "12", value: "12" }
        ],
        sizeGuide: new Map([
          ["5", "EU 35"], ["6", "EU 36"], ["7", "EU 37"],
          ["8", "EU 38"], ["9", "EU 39"], ["10", "EU 40"],
          ["11", "EU 41"], ["12", "EU 42"]
        ])
      },
      {
        name: "brand",
        label: "Brand",
        type: "select",
        required: false,
        order: 3,
        options: []
      }
    ]
  },
  
  // ── BEAUTY & COSMETICS ───────────────────────────────────────────────
  {
    name: "Beauty",
    slug: "beauty",
    description: "Cosmetics, skincare, and fragrances",
    icon: "💄",
    uiTemplate: "default",
    filterableAttributes: ["brand", "shade", "type"],
    attributes: [
      {
        name: "shade",
        label: "Shade",
        type: "color",
        required: false,
        order: 1,
        options: []
      },
      {
        name: "brand",
        label: "Brand",
        type: "select",
        required: false,
        order: 2,
        options: []
      },
      {
        name: "size",
        label: "Size (ml/g)",
        type: "select",
        required: false,
        order: 3,
        options: [
          { name: "15ml", value: "15" },
          { name: "30ml", value: "30" },
          { name: "50ml", value: "50" },
          { name: "100ml", value: "100" }
        ]
      }
    ]
  }
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('📦 Connected to MongoDB');

    // Clear existing categories (optional - comment out to keep existing)
    // await Category.deleteMany({});
    // console.log('🗑️ Cleared existing categories');

    // Insert categories
    let created = 0;
    let skipped = 0;

    for (const category of categories) {
      const existing = await Category.findOne({ slug: category.slug });
      if (!existing) {
        await Category.create(category);
        console.log(`✅ Created category: ${category.name}`);
        created++;
      } else {
        console.log(`⏭️ Skipped (already exists): ${category.name}`);
        skipped++;
      }
    }

    console.log('\n🎉 Seeding complete!');
    console.log(`📊 Created: ${created} | Skipped: ${skipped} | Total: ${categories.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run seeder
seedCategories();