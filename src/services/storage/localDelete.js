// services/storage/localDelete.js
const path = require('path');
const fs = require('fs').promises;
const { URL } = require('url');

module.exports = async (url) => {
  try {
    // Extract relative path from URL
    const urlObj = new URL(url);
    let filePath = urlObj.pathname;
    
    // Remove base URL prefix if present
    if (process.env.BASE_URL) {
      const baseUrlPath = new URL(process.env.BASE_URL).pathname;
      filePath = filePath.replace(baseUrlPath, '');
    }

    // Determine physical file path
    const fullPath = filePath.startsWith('/posters')
      ? path.join(__dirname, '../../../public', filePath)
      : path.join(__dirname, '../../../private', filePath);

    await fs.unlink(fullPath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw new Error(`File deletion failed: ${err.message}`);
    }
  }
};