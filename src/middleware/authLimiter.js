const rateLimit = require('express-rate-limit');
const logger = require('../services/logger'); 

// Rate Limiter for Authentication routes
module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per IP
  message: 'Too many login attempts. Try again later.',
  skipSuccessfulRequests: true, // Only count failed attempts
  handler: (req, res, next, options) => {
    logger.error(`Rate limit exceeded for IP: ${req.ip}`, {
      path: req.path,
      method: req.method 
    });
    res.status(options.statusCode).send(options.message);
  }
});