const { body, param, query, validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../config/constants');
const ResponseHandler = require('./responseHandler');

// Common validation rules
const commonRules = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  deviceId: body('deviceId')
    .notEmpty()
    .withMessage('Device ID is required'),

  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  userId: param('userId')
    .isMongoId()
    .withMessage('Invalid user ID format'),

  emailId: param('emailId')
    .isMongoId()
    .withMessage('Invalid email ID format'),
};

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return ResponseHandler.badRequest(res, 'Validation failed', {
      errors: errorMessages,
      fields: errors.array().map(error => error.path),
    });
  }
  
  next();
};

// Auth validation
const authValidation = {
  signup: [
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    commonRules.email,
    commonRules.password,
    commonRules.deviceId,
    validate,
  ],

  signin: [
    commonRules.email,
    commonRules.password,
    commonRules.deviceId,
    validate,
  ],
};

// Admin validation
const adminValidation = {
  getUsers: [
    commonRules.page,
    commonRules.limit,
    query('search')
      .optional()
      .isString()
      .withMessage('Search must be a string'),
    validate,
  ],

  getNotifications: [
    commonRules.page,
    commonRules.limit,
    query('deviceId')
      .optional()
      .isString()
      .withMessage('Device ID must be a string'),
    validate,
  ],

  getEmails: [
    commonRules.page,
    commonRules.limit,
    query('isRead')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('isRead must be true or false'),
    validate,
  ],
};

// Gmail validation
const gmailValidation = {
  handleCallback: [
    body('code')
      .notEmpty()
      .withMessage('Authorization code is required'),
    body('collectorEmail')
      .isEmail()
      .withMessage('Collector email must be valid'),
    validate,
  ],

  enableForwarding: [
    commonRules.userId,
    validate,
  ],

  forwardExistingEmails: [
    commonRules.userId,
    body('batchSize')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Batch size must be between 1 and 100'),
    validate,
  ],
};

// File upload validation
const fileValidation = {
  uploadMedia: [
    body('deviceId')
      .notEmpty()
      .withMessage('Device ID is required'),
    body('metadata')
      .optional()
      .isJSON()
      .withMessage('Metadata must be valid JSON'),
    validate,
  ],
};

// Custom validators
const customValidators = {
  // Check if user is admin
  isAdmin: (req, res, next) => {
    const user = req.user;
    if (!user || (!user.isAdmin && user.role !== 'admin')) {
      return ResponseHandler.forbidden(res, 'Admin access required');
    }
    next();
  },

  // Check if user owns resource
  ownsResource: (resourceField = 'userId') => {
    return (req, res, next) => {
      const user = req.user;
      const resourceUserId = req.params[resourceField] || req.body[resourceField];
      
      if (!user) {
        return ResponseHandler.unauthorized(res);
      }
      
      if (user.isAdmin || user.role === 'admin') {
        return next(); // Admin can access all resources
      }
      
      if (user._id.toString() !== resourceUserId) {
        return ResponseHandler.forbidden(res, 'Access denied to this resource');
      }
      
      next();
    };
  },

  // Rate limiting helper
  rateLimit: (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();
    
    return (req, res, next) => {
      const ip = req.ip;
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Clean old requests
      if (requests.has(ip)) {
        requests.set(ip, requests.get(ip).filter(timestamp => timestamp > windowStart));
      } else {
        requests.set(ip, []);
      }
      
      const userRequests = requests.get(ip);
      
      if (userRequests.length >= maxRequests) {
        return ResponseHandler.tooManyRequests(res);
      }
      
      userRequests.push(now);
      next();
    };
  },
};

module.exports = {
  commonRules,
  validate,
  authValidation,
  adminValidation,
  gmailValidation,
  fileValidation,
  customValidators,
}; 