const multer = require('multer');
const { Readable } = require('stream');
const cloudinary = require('../config/cloudinaryConfig');

// Use memory storage — never save images to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5,                   // Max 5 images per product
  },
});

// Upload a single buffer to Cloudinary via stream
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        quality: 'auto',       // Auto compress
        fetch_format: 'auto',  // Auto convert to WebP if supported
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

// Full middleware: multer parse → upload each file to Cloudinary
const uploadImages = [
  upload.array('images', 5),
  async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next(); // no files = ok
    try {
      req.uploadedImages = await Promise.all(
        req.files.map(f => uploadToCloudinary(f.buffer, 'ecommerce/products'))
      );
      next();
    } catch (err) {
      next(err);
    }
  },
];

// Single avatar upload for profile
const uploadAvatar = [
  upload.single('avatar'),
  async (req, res, next) => {
    if (!req.file) return next();
    try {
      req.uploadedAvatar = await uploadToCloudinary(req.file.buffer, 'ecommerce/avatars');
      next();
    } catch (err) {
      next(err);
    }
  },
];

module.exports = { uploadImages, uploadAvatar };
