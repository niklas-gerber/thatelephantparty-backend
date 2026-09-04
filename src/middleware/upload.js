// middleware/upload.js
const multer = require('multer');
const { BadRequestError } = require('../errors/customErrors'); // Add this import
const path = require('path');

// Uploadmiddleware: multer + filter
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    console.log('Multer processing file:', file); 
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.png', '.jpg', '.jpeg', '.webp'];
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (allowedExts.includes(ext) && validMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError('File type not allowed (JPEG, PNG, WebP only)')); // Explicit error
    }
  }
});

module.exports = upload;