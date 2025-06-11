const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable not configured");

// Generate a token (1h expiry)
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

// Verify token from cookie
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };