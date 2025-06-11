// middleware/upload.js
const multer = require('multer');
const { BadRequestError } = require('../errors/customErrors'); // Add this import

// Uploadmiddleware: multer + filter
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    console.log('Multer processing file:', file); 
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (validMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError('File type not allowed (JPEG, PNG, WebP only)')); // Explicit error
    }
  }
});

module.exports = upload;