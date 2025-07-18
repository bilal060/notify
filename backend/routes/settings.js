const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Get current settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings'
    });
  }
});

// Update settings
router.put('/', async (req, res) => {
  try {
    const updates = req.body;
    const settings = await Settings.updateSettings(updates);
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

// Check if data type should be updated
router.get('/should-update/:dataType/:subType?', async (req, res) => {
  try {
    const { dataType, subType } = req.params;
    const settings = await Settings.getSettings();
    
    const shouldUpdate = settings.shouldUpdate(dataType, subType);
    
    res.json({
      success: true,
      shouldUpdate,
      dataType,
      subType,
      lastUpdate: subType ? 
        settings[dataType][subType].lastUpdate : 
        settings[dataType].lastUpdate
    });
  } catch (error) {
    console.error('Error checking update status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check update status'
    });
  }
});

// Update last update time for a data type
router.post('/update-time/:dataType/:subType?', async (req, res) => {
  try {
    const { dataType, subType } = req.params;
    const settings = await Settings.getSettings();
    
    await settings.updateLastUpdate(dataType, subType);
    
    res.json({
      success: true,
      message: 'Update time recorded successfully',
      dataType,
      subType
    });
  } catch (error) {
    console.error('Error updating last update time:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update last update time'
    });
  }
});

// Reset all update times
router.post('/reset-times', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Reset all lastUpdate times
    settings.whatsapp.messages.lastUpdate = null;
    settings.whatsapp.contacts.lastUpdate = null;
    settings.whatsapp.businessData.lastUpdate = null;
    settings.facebook.lastUpdate = null;
    settings.notifications.lastUpdate = null;
    settings.sms.lastUpdate = null;
    settings.email.lastUpdate = null;
    settings.callLogs.lastUpdate = null;
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'All update times reset successfully'
    });
  } catch (error) {
    console.error('Error resetting update times:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset update times'
    });
  }
});

module.exports = router; 