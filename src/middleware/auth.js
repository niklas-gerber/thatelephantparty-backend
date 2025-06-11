const { verifyToken } = require('../utils/jwtUtils');
const { AuthError } = require('../errors/customErrors');

// 'protect' authentication middleware for all Admin Routes
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    
    if (!token) {
      throw new AuthError('No authentication token provided');
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    next(err); // Forward to errorHandler.js
  }
};

module.exports = { protect };