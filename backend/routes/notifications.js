const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticateToken, requireSubscription } = require('../middleware/auth');

const router = express.Router();

// Public route for storing notifications from mobile devices
router.post('/store', notificationController.storeNotification);

// Protected routes (require authentication only for testing)
router.get('/', authenticateToken, notificationController.getUserNotifications); // Temporarily removed subscription requirement
router.put('/:notificationId/read', authenticateToken, notificationController.markAsRead); // Temporarily removed subscription requirement
router.put('/mark-all-read', authenticateToken, notificationController.markAllAsRead); // Temporarily removed subscription requirement
router.delete('/:notificationId', authenticateToken, notificationController.deleteNotification); // Temporarily removed subscription requirement
router.get('/stats', authenticateToken, notificationController.getNotificationStats); // Temporarily removed subscription requirement
router.get('/url', authenticateToken, notificationController.getUserUrl); // Temporarily removed subscription requirement for testing

module.exports = router; 