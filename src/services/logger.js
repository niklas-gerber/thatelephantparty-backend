const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { combine, timestamp, printf, errors } = winston.format;
const path = require('path');

// Winston Logger Service
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
  if (stack) log += `\n${stack}`;
  if (metadata.stack) log += `\n${metadata.stack}`;  // Check metadata for stack
  return log;
});

// Create logger instance
const logger = winston.createLogger({
  level: 'info', // Default log level
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // Include error stacks
    logFormat
  ),
  transports: [
    // Console (pretty) logging for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    new DailyRotateFile({
      filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '2m',  // Rotate after 20MB
      maxFiles: '14d',  // Keep logs for 14 days
      level: 'info'
    }),
    new DailyRotateFile({
      filename: path.join(__dirname, '../../logs/errors-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '2m',
      maxFiles: '30d',  // Keep error logs longer (30 days)
      level: 'error'
    })
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(__dirname, '../../logs/exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '2m',
      maxFiles: '30d'
    })
  ]
});

// Handle uncaught promise rejections
process.on('unhandledRejection', (ex) => {
  throw ex; // Let winston handle it
});

module.exports = logger;
