// backend/services/storage/localUpload.js
const fs = require('fs').promises;
const path = require('path');
const { NotFoundError } = require('../../errors/customErrors');
const sanitizeFilename = require('../../utils/sanitizeFilename');

module.exports = (basePath, config = {}) => async (file) => {
  if (!file) throw new NotFoundError('No file uploaded');

  try {
    // Ensure target directory exists
    await fs.mkdir(basePath, { recursive: true });

    // Generate safe filename
    const filename = sanitizeFilename(file.originalname, {
      useUuid: config.useUuid ?? false,  // UUID for payslips, sanitized names for posters
      keepExtension: true
    });

    // Save file
    const filePath = path.join(basePath, filename);
    await fs.writeFile(filePath, file.buffer);

    // Return absolute URL (e.g., http://localhost:3000/uploads/payslips/filename.jpg)
    const urlPrefix = basePath.includes('posters') ? '/posters' : '/uploads/payslips';
    const urlPath = `${urlPrefix}/${filename}`;
    return `${process.env.BASE_URL || 'http://localhost:3000'}${urlPath}`;
  
  } catch (err) {
    throw new Error(`File save failed: ${err.message}`);
  }
};