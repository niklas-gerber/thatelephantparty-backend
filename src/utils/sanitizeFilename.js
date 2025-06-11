// backend/utils/sanitizeFilename.js
const { v4: uuidv4 } = require('uuid');

/**
 * Sanitizes filenames and optionally uses UUID
 * @param {string} originalName - Original filename
 * @param {object} options - { useUuid: boolean, keepExtension: boolean }
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(originalName, options = {}) {
  const { useUuid = false, keepExtension = true } = options;
  
  // Get file extension
  const ext = keepExtension 
    ? originalName.slice(originalName.lastIndexOf('.')) 
    : '';

  // Generate base name (either UUID or sanitized original)
  let baseName;
  if (useUuid) {
    baseName = uuidv4();
  } else {
    baseName = originalName
      .replace(/\.[^/.]+$/, '') // Remove existing extension
      .replace(/[<>:"/\\|?*\s]+/g, '-') // Replace bad chars
      .replace(/-+/g, '-') // Collapse dashes
      .replace(/^-+|-+$/g, '') // Trim dashes
      .toLowerCase();
  }

  return `${baseName}${ext}`;
}

module.exports = sanitizeFilename;