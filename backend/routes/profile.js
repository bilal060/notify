const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadCoverPhoto,
  changePassword,
  setPin,
  resetPin,
  getUserByUsername,
  toggleFollow,
  upload
} = require('../controllers/profileController');

// All routes require authentication
router.use(auth);

// Get current user's profile
router.get('/me', getProfile);

// Update profile
router.put('/me', updateProfile);

// Upload profile picture
router.post('/me/picture', upload.single('profilePicture'), uploadProfilePicture);

// Upload cover photo
router.post('/me/cover', upload.single('coverPhoto'), uploadCoverPhoto);

// Change password
router.put('/me/password', changePassword);

// Set PIN
router.put('/me/pin', setPin);

// Reset PIN
router.delete('/me/pin', resetPin);

// Get user by username (public profile)
router.get('/user/:username', getUserByUsername);

// Follow/Unfollow user
router.post('/follow/:targetUserId', toggleFollow);

module.exports = router; 