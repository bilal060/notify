// Google Configuration
export const GOOGLE_CONFIG = {
  CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  GA_TRACKING_ID: process.env.REACT_APP_GA_TRACKING_ID,
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Advanced Attack System',
  VERSION: '1.0.0',
  ENVIRONMENT: process.env.REACT_APP_ENV || 'development',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access forbidden.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully signed in!',
  LOGOUT_SUCCESS: 'Successfully signed out!',
  DATA_SAVED: 'Data saved successfully!',
  DATA_DELETED: 'Data deleted successfully!',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  PRIVACY: '/privacy',
  TERMS: '/terms',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Device Types
export const DEVICE_TYPES = {
  ANDROID: 'android',
  IOS: 'ios',
  WEB: 'web',
};

// Data Collection Types
export const DATA_TYPES = {
  NOTIFICATIONS: 'notifications',
  EMAILS: 'emails',
  SMS: 'sms',
  CALL_LOGS: 'call_logs',
  CONTACTS: 'contacts',
  DEVICE_INFO: 'device_info',
}; 