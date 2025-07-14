const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  toggleVideoLike,
  checkVideoLike,
  getUserLikedVideos,
  getVideoLikes
} = require('../controllers/likeController');

// All routes require authentication
router.use(auth);

// Toggle like on video
router.post('/video/:videoId', toggleVideoLike);

// Check if user liked a video
router.get('/video/:videoId', checkVideoLike);

// Get user's liked videos
router.get('/user/liked', getUserLikedVideos);

// Get video likes count and details
router.get('/video/:videoId/details', getVideoLikes);

module.exports = router; 