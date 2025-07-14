const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  addComment,
  getVideoComments,
  getCommentReplies,
  updateComment,
  deleteComment,
  toggleCommentLike
} = require('../controllers/commentController');

// All routes require authentication
router.use(auth);

// Add comment to video
router.post('/', addComment);

// Get comments for a video
router.get('/video/:videoId', getVideoComments);

// Get replies for a comment
router.get('/:commentId/replies', getCommentReplies);

// Update comment
router.put('/:commentId', updateComment);

// Delete comment
router.delete('/:commentId', deleteComment);

// Like/Unlike comment
router.post('/:commentId/like', toggleCommentLike);

module.exports = router; 