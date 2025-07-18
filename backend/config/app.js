const path = require('path');

module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5001,
    host: '0.0.0.0',
    environment: process.env.NODE_ENV || 'development'
  },

  // Database Configuration
  database: {
    url: process.env.MONGO_URL,
    name: 'mob_notifications',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '7d'
  },

  // CORS Configuration
  cors: {
    allowedOrigins: [
      'http://localhost:3000', // Development frontend
      'https://notify-sepia.vercel.app', // Production frontend
      '*' // Allow all origins for mobile app
    ],
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
  },

  // File Upload Configuration
  upload: {
    maxSize: '50mb',
    uploadsDir: path.join(__dirname, '../uploads'),
    publicDir: path.join(__dirname, '../public')
  },

  // Firebase Configuration
  firebase: {
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://tour-dubai-79253.firebaseio.com',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'tour-dubai-79253.appspot.com'
  },

  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:5001',
    version: '1.0.0',
    documentation: 'https://notify-oxh1.onrender.com',
    healthCheck: 'https://notify-oxh1.onrender.com/health'
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'combined'
  }
}; 