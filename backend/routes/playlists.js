const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createPlaylist,
  getUserPlaylists,
  getPublicPlaylistsByUser,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  reorderPlaylistVideos
} = require('../controllers/playlistController');

// All routes require authentication
router.use(auth);

// Create playlist
router.post('/', createPlaylist);

// Get user's playlists
router.get('/user', getUserPlaylists);

// Get public playlists by user
router.get('/user/:username', getPublicPlaylistsByUser);

// Get playlist by ID
router.get('/:playlistId', getPlaylistById);

// Update playlist
router.put('/:playlistId', updatePlaylist);

// Delete playlist
router.delete('/:playlistId', deletePlaylist);

// Add video to playlist
router.post('/:playlistId/videos', addVideoToPlaylist);

// Remove video from playlist
router.delete('/:playlistId/videos/:videoId', removeVideoFromPlaylist);

// Reorder videos in playlist
router.put('/:playlistId/reorder', reorderPlaylistVideos);

module.exports = router; 