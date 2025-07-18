// Server Configuration
const SERVER_CONFIG = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGINS: [
    'http://localhost:3000',
    'https://notify-sepia.vercel.app',
    '*', // Allow all origins for mobile app
  ],
};

// JWT Configuration
const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-secret-key',
  EXPIRES_IN: '7d',
  REFRESH_EXPIRES_IN: '30d',
};

// Gmail API Configuration
const GMAIL_CONFIG = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/gmail/callback',
  SCOPES: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.settings.basic'
  ],
  COLLECTOR_EMAIL: 'mbila.dev13@gmail.com',
};

// Database Configuration
const DATABASE_CONFIG = {
  URL: process.env.MONGO_URL || 'mongodb://localhost:27017/notification_system',
  NAME: 'mob_notifications',
  OPTIONS: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
};

// File Upload Configuration
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: /jpeg|jpg|png|gif|mp4|avi|mov|mkv|webm/,
  UPLOAD_DIR: 'uploads',
  TEMP_DIR: 'temp',
};

// Pagination Configuration
const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
};

// Rate Limiting Configuration
const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // limit each IP to 100 requests per windowMs
  MESSAGE: 'Too many requests from this IP, please try again later.',
};

// Email Configuration
const EMAIL_CONFIG = {
  BATCH_SIZE: 50,
  RATE_LIMIT_DELAY: 100, // milliseconds
  MAX_EMAILS_PER_REQUEST: 100,
};

// Admin Configuration
const ADMIN_CONFIG = {
  EMAIL: 'mbilal.admin@gmail.com',
  ROLE: 'admin',
  PERMISSIONS: ['read', 'write', 'delete', 'admin'],
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Messages
const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  UNAUTHORIZED: 'Access denied. No token provided.',
  INVALID_TOKEN: 'Invalid token. User not found.',
  ACCOUNT_DEACTIVATED: 'Account is deactivated.',
  FORBIDDEN: 'Access denied. Admin privileges required.',
  NOT_FOUND: 'Resource not found',
  DUPLICATE_ENTRY: 'Entry already exists',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  SERVER_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed',
  FILE_UPLOAD_ERROR: 'File upload failed',
  GMAIL_API_ERROR: 'Gmail API error',
};

// Success Messages
const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  EMAIL_FETCHED: 'Emails fetched successfully',
  EMAIL_FORWARDED: 'Email forwarding enabled',
  DATA_SAVED: 'Data saved successfully',
  OPERATION_SUCCESS: 'Operation completed successfully',
};

// Logging Configuration
const LOGGING_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  FORMAT: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  FILE: 'logs/app.log',
  MAX_SIZE: '10m',
  MAX_FILES: '5',
};

module.exports = {
  SERVER_CONFIG,
  JWT_CONFIG,
  GMAIL_CONFIG,
  DATABASE_CONFIG,
  UPLOAD_CONFIG,
  PAGINATION_CONFIG,
  RATE_LIMIT_CONFIG,
  EMAIL_CONFIG,
  ADMIN_CONFIG,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOGGING_CONFIG,
}; 