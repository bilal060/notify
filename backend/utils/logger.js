const winston = require('winston');
const path = require('path');
const { LOGGING_CONFIG } = require('../config/constants');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: LOGGING_CONFIG.LEVEL,
  format: logFormat,
  defaultMeta: { service: 'notification-system' },
  transports: [
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    // File transport for error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Custom logging methods
const customLogger = {
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },

  error: (message, error = null, meta = {}) => {
    const logData = {
      ...meta,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        }
      })
    };
    logger.error(message, logData);
  },

  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },

  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },

  // API request logging
  request: (req, res, responseTime) => {
    logger.info('API Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.userId || 'anonymous',
    });
  },

  // Database operation logging
  db: (operation, collection, duration, meta = {}) => {
    logger.info('Database Operation', {
      operation,
      collection,
      duration: `${duration}ms`,
      ...meta,
    });
  },

  // Email operation logging
  email: (operation, email, meta = {}) => {
    logger.info('Email Operation', {
      operation,
      email: email.replace(/@.*/, '@***'), // Mask email domain
      ...meta,
    });
  },

  // Security event logging
  security: (event, details, meta = {}) => {
    logger.warn('Security Event', {
      event,
      details,
      ...meta,
    });
  },

  // Performance logging
  performance: (operation, duration, meta = {}) => {
    logger.info('Performance', {
      operation,
      duration: `${duration}ms`,
      ...meta,
    });
  },
};

module.exports = customLogger; 