


const mongoose = require('mongoose');

// Use your actual MongoDB URI
const MONGO_URI = "mongodb+srv://umerakramk15_db_user:umer1190@fyp.9mcgb3s.mongodb.net/?appName=FYP"

const colorOptions = [
  { name: "Blush Rose", hex: "#f9d5d3", textDark: true },
  { name: "Dusty Mauve", hex: "#c4a0b0", textDark: false },
  { name: "Ivory Cream", hex: "#f5f0e8", textDark: true },
  { name: "Sage Mist", hex: "#b5c4b1", textDark: false },
  { name: "Midnight Plum", hex: "#3d2040", textDark: false }
];

async function updateColors() {
  await mongoose.connect(MONGO_URI);
  
  // Update shirts category
  const result = await mongoose.connection.db.collection('products').updateMany(
    { category: "shirts" },  // ← Changed from "clothing" to "shirts"
    { $set: { "availableAttributes.color": colorOptions } }
  );
  
  console.log(`✅ Updated ${result.modifiedCount} shirts`);
  
  process.exit(0);
}

updateColors();