const express = require('express');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);

// Protected routes
router.get('/me', auth, authController.getCurrentUser);
router.put('/profile', auth, authController.updateProfile);

module.exports = router; 