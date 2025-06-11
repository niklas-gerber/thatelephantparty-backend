const rateLimit = require('express-rate-limit');
const logger = require('../services/logger');

module.exports = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per IP
  message: 'Too many requests from this IP. Try again later.',
  skip: (req) => false,
  handler: (req, res, next, options) => {
    logger.error(`API rate limit exceeded - IP: ${req.ip} | X-Forwarded-For: ${req.headers['x-forwarded-for']}`, {
      path: req.path,
      method: req.method
    });
    res.status(options.statusCode).send(options.message);
  },
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.ip;
  }
});