/* // controllers/uploadController.js
const storage = require('../services/storage');
const { BadRequestError } = require('../errors/customErrors');

exports.handleUpload = async (req, res) => {
  if (!req.file) throw new BadRequestError('No file uploaded');
  
  // Determine upload type (public or private)
  const isPrivateRoute = req.originalUrl.startsWith('/api/v1/private');
  const saveMethod = isPrivateRoute ? storage.savePrivateFile : storage.savePublicFile;
  
  const url = await saveMethod(req.file);
  res.json({ url });
};
*/