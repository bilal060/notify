const express = require('express');
const facebookController = require('../controllers/facebookController');

const router = express.Router();

// Public routes for Facebook data extraction
router.get('/profile/:profileId', facebookController.getPublicProfile);
router.get('/posts/:profileId', facebookController.getPublicPosts);
router.get('/insights/:pageId', facebookController.getPageInsights);
router.get('/search', facebookController.searchProfiles);

// NEW: Email fetching by Facebook ID
router.get('/emails/:facebookId', facebookController.fetchEmailsByFacebookId);

// Mobile app data storage
router.post('/mobile/store', facebookController.storeMobileData);

// Data retrieval routes
router.get('/profiles', facebookController.getAllProfiles);
router.get('/posts', facebookController.getAllPosts);

module.exports = router; 