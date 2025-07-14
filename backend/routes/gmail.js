const express = require('express');
const router = express.Router();
const {
  getAuthUrl,
  handleCallback,
  enableForwarding,
  forwardExistingEmails,
  getAccountStats,
  disableForwarding,
  getUserGmailAccounts,
  deleteGmailAccount,
  testConnection,
  // New email storage endpoints
  saveEmailsToDatabase,
  getStoredEmails,
  getEmailStats,
  markEmailAsRead,
  syncNewEmails
} = require('../controllers/gmailController');
const { auth } = require('../middleware/auth');

// OAuth endpoints
router.get('/auth/url', getAuthUrl);
router.post('/auth/callback', handleCallback);

// Gmail account management (requires authentication)
router.get('/accounts/:userId', auth, getUserGmailAccounts);
router.delete('/accounts/:userId/:accountId', auth, deleteGmailAccount);

// Email forwarding operations
router.post('/forwarding/:userId/enable', auth, enableForwarding);
router.post('/forwarding/:userId/disable', auth, disableForwarding);
router.post('/forwarding/:userId/existing', auth, forwardExistingEmails);

// Account information
router.get('/stats/:userId', auth, getAccountStats);
router.get('/test/:userId', auth, testConnection);

// NEW: Email storage endpoints (no auth required for mobile app)
router.post('/store/:userId', saveEmailsToDatabase);
router.get('/emails/:userId', getStoredEmails);
router.get('/emails/:userId/stats', getEmailStats);
router.put('/emails/:emailId/read', markEmailAsRead);
router.post('/sync/:userId', syncNewEmails);

module.exports = router; 