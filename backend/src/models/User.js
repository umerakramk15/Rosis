const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema({
  label: { type: String, enum: ["home", "work", "other"], default: "home" },
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  province: { type: String, trim: true },
  postalCode: { type: String, trim: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    passwordHash: { type: String, required: true, select: false }, // Never returned by default
    role: { type: String, enum: ["customer", "merchant"], default: "customer" },
    avatar: { type: String, default: "" }, // Cloudinary URL
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isSuspended: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    passwordChangedAt: Date,
  },
  { timestamps: true },
);

// ── Pre-save: Hash password before storing ──────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(
    this.passwordHash,
    parseInt(process.env.BCRYPT_ROUNDS) || 12,
  );
  next();
});

// ── Instance method: Compare password on login ──────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// ── Instance method: Was password changed after JWT was issued? ─────
userSchema.methods.passwordChangedAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtIssuedAt < changedAt;
  }
  return false;
};

// ── Indexes ─────────────────────────────────────────────────────────

module.exports = mongoose.model("User", userSchema);
