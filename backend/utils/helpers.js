const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/app');

// JWT Utilities
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

// Password Utilities
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// ID Utilities
const generateUniqueId = () => uuidv4();

const generateUniqueUsername = (email) => {
  const base = email.split('@')[0];
  const random = Math.random().toString(36).substr(2, 8);
  return `${base}_${random}`;
};

const generateUniqueDeviceId = (googleId) => {
  const random = Math.random().toString(36).substr(2, 5);
  return `google_${googleId}_${random}`;
};

// Validation Utilities
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  return password && password.length >= 6;
};

const isValidDeviceId = (deviceId) => {
  return deviceId && deviceId.length > 0;
};

// Response Utilities
const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data
});

const errorResponse = (message = 'Error occurred', statusCode = 500) => ({
  success: false,
  message,
  statusCode
});

// Date Utilities
const formatDate = (date) => {
  return new Date(date).toISOString();
};

const isDateValid = (date) => {
  return !isNaN(new Date(date).getTime());
};

// Array Utilities
const removeDuplicates = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = key ? item[key] : item;
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// String Utilities
const sanitizeString = (str) => {
  return str ? str.trim().replace(/[<>]/g, '') : '';
};

const truncateString = (str, length = 100) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};

// Error Handling
const handleAsyncError = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const logError = (error, context = '') => {
  console.error(`[${new Date().toISOString()}] ${context}:`, error);
};

module.exports = {
  // JWT
  generateToken,
  verifyToken,
  
  // Password
  hashPassword,
  comparePassword,
  
  // ID Generation
  generateUniqueId,
  generateUniqueUsername,
  generateUniqueDeviceId,
  
  // Validation
  isValidEmail,
  isValidPassword,
  isValidDeviceId,
  
  // Response
  successResponse,
  errorResponse,
  
  // Date
  formatDate,
  isDateValid,
  
  // Array
  removeDuplicates,
  chunkArray,
  
  // String
  sanitizeString,
  truncateString,
  
  // Error Handling
  handleAsyncError,
  logError
}; 