const User = require('../models/User');
const asyncWrapper = require('../utils/asyncWrapper');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const cloudinary = require('../config/cloudinaryConfig');

// ── GET PROFILE ───────────────────────────────────────────────────────
exports.getProfile = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-passwordHash -wishlist');
  if (!user) return sendError(res, 404, 'User not found.');
  sendSuccess(res, 200, 'Profile fetched', user);
});

// ── UPDATE PROFILE ────────────────────────────────────────────────────
exports.updateProfile = asyncWrapper(async (req, res) => {
  const { name, phone } = req.body;

  const updates = {};
  if (name) updates.name = name.trim();
  if (phone) updates.phone = phone.trim();

  // If new avatar uploaded via upload.middleware
  if (req.uploadedAvatar) {
    // Delete old avatar from Cloudinary if exists
    const user = await User.findById(req.user._id);
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId).catch(console.error);
    }
    updates.avatar = req.uploadedAvatar.url;
    updates.avatarPublicId = req.uploadedAvatar.publicId;
  }

  const updated = await User.findByIdAndUpdate(
    req.user._id, updates, { new: true, runValidators: true }
  ).select('-passwordHash -wishlist');

  sendSuccess(res, 200, 'Profile updated', updated);
});

// ── GET ALL ADDRESSES ─────────────────────────────────────────────────
exports.getAddresses = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses');
  sendSuccess(res, 200, 'Addresses fetched', user.addresses);
});

// ── ADD ADDRESS ───────────────────────────────────────────────────────
exports.addAddress = asyncWrapper(async (req, res) => {
  const { label, street, city, province, postalCode, isDefault } = req.body;

  const user = await User.findById(req.user._id);

  // If new address is default, unset all others
  if (isDefault) {
    user.addresses.forEach(addr => { addr.isDefault = false; });
  }

  // Max 5 addresses per user
  if (user.addresses.length >= 5) {
    return sendError(res, 400, 'Maximum 5 addresses allowed. Delete one first.');
  }

  user.addresses.push({ label, street, city, province, postalCode, isDefault: !!isDefault });
  await user.save();

  sendSuccess(res, 201, 'Address added', user.addresses);
});

// ── UPDATE ADDRESS ────────────────────────────────────────────────────
exports.updateAddress = asyncWrapper(async (req, res) => {
  const { addressId } = req.params;
  const { label, street, city, province, postalCode, isDefault } = req.body;

  const user = await User.findById(req.user._id);
  const address = user.addresses.id(addressId);
  if (!address) return sendError(res, 404, 'Address not found.');

  // If setting as default, unset all others first
  if (isDefault) {
    user.addresses.forEach(addr => { addr.isDefault = false; });
  }

  if (label)      address.label      = label;
  if (street)     address.street     = street;
  if (city)       address.city       = city;
  if (province)   address.province   = province;
  if (postalCode) address.postalCode = postalCode;
  if (isDefault !== undefined) address.isDefault = isDefault;

  await user.save();
  sendSuccess(res, 200, 'Address updated', user.addresses);
});

// ── DELETE ADDRESS ────────────────────────────────────────────────────
exports.deleteAddress = asyncWrapper(async (req, res) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);
  const address = user.addresses.id(addressId);
  if (!address) return sendError(res, 404, 'Address not found.');

  address.deleteOne();
  await user.save();

  sendSuccess(res, 200, 'Address deleted', user.addresses);
});

// ── SET DEFAULT ADDRESS ───────────────────────────────────────────────
exports.setDefaultAddress = asyncWrapper(async (req, res) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);
  const address = user.addresses.id(addressId);
  if (!address) return sendError(res, 404, 'Address not found.');

  user.addresses.forEach(addr => { addr.isDefault = false; });
  address.isDefault = true;
  await user.save();

  sendSuccess(res, 200, 'Default address updated', user.addresses);
});
