const express = require('express');
const mediaController = require('../controllers/mediaController');

const router = express.Router();

// Public route for storing media from mobile devices
router.post('/upload', mediaController.uploadMedia);

// Get all media (no auth required)
router.get('/', mediaController.getAllMedia);

// Get media by device
router.get('/device/:deviceId', mediaController.getDeviceMedia);

// Get media statistics
router.get('/stats', mediaController.getMediaStats);

module.exports = router; 