const express = require('express');
const notificationController = require('../controllers/notificationController');
const Notification = require('../models/Notification');

const router = express.Router();

// Test endpoint to verify notification system
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Notification system is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      store: 'POST /api/notifications/store',
      batch: 'POST /api/notifications/store/batch',
      getAll: 'GET /api/notifications',
      device: 'GET /api/notifications/device/:deviceId'
    }
  });
});

// Public route for storing notifications from mobile devices
router.post('/store', notificationController.storeNotification);

// Public route for storing batch notifications from mobile devices
router.post('/store/batch', notificationController.storeBatchNotifications);

// Get all notifications (no auth required)
router.get('/', notificationController.getAllNotifications);

// Get notifications by device
router.get('/device/:deviceId', notificationController.getDeviceNotifications);

// Get notification statistics
router.get('/stats', notificationController.getNotificationStats);

// Mark notifications as read
router.put('/read/:deviceId', notificationController.markAsRead);

// Delete notification
router.delete('/:notificationId/:deviceId', notificationController.deleteNotification);

module.exports = router; 