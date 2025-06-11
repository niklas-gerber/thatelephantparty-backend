const { AppError } = require('../errors/customErrors');
const logger = require('../services/logger');
const isDev = false; // Force production mode

module.exports = (err, req, res, next) => {
  // Defaults for unexpected errors (e.g., programmer mistakes)
  err.statusCode = err.statusCode || 500;
  err.errorType = err.errorType || 'INTERNAL_ERROR';

  // Log detailed error in development
  if (process.env.NODE_ENV === 'development') {
    logger.error(err.message, {
      path: req.path,
      method: req.method,
      stack: err.stack,  // Full stack trace
      body: req.body     // Request payload (for debugging)
    });
  }

  // Production: Log simplified error
  if (process.env.NODE_ENV === 'production') {
    logger.error(`[${err.errorType}] ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path
    });
  }

  // Send response (hide stack in production)
  res.status(err.statusCode).json({
    error: {
      type: err.errorType,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        details: err.details 
      })
    }
  });
};