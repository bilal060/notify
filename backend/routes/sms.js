const express = require('express');
const router = express.Router();
const SMS = require('../models/SMS');

// Store SMS messages
router.post('/store', async (req, res) => {
  try {
    const { deviceId, messages, timestamp } = req.body;
    
    if (!deviceId || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Store each SMS message
    const savedMessages = [];
    for (const message of messages) {
      const newSMS = new SMS({
        deviceId,
        address: message.address,
        body: message.body,
        date: new Date(message.date),
        type: message.type,
        timestamp: new Date(timestamp)
      });
      
      const saved = await newSMS.save();
      savedMessages.push(saved);
    }

    res.status(201).json({
      message: `Stored ${savedMessages.length} SMS messages`,
      count: savedMessages.length
    });
  } catch (error) {
    console.error('Error storing SMS messages:', error);
    res.status(500).json({ error: 'Failed to store SMS messages' });
  }
});

// Get SMS messages for a device
router.get('/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 100, offset = 0, type } = req.query;
    
    let query = { deviceId };
    if (type) {
      query.type = type;
    }
    
    const messages = await SMS.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await SMS.countDocuments(query);
    
    res.json({
      messages,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching SMS messages:', error);
    res.status(500).json({ error: 'Failed to fetch SMS messages' });
  }
});

// Get SMS statistics
router.get('/stats', async (req, res) => {
  try {
    const totalMessages = await SMS.countDocuments();
    const uniqueDevices = await SMS.distinct('deviceId').countDocuments();
    
    // Get message types distribution
    const messageTypes = await SMS.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get unique addresses
    const uniqueAddresses = await SMS.distinct('address').countDocuments();
    
    res.json({
      totalMessages,
      uniqueDevices,
      uniqueAddresses,
      messageTypes
    });
  } catch (error) {
    console.error('Error fetching SMS stats:', error);
    res.status(500).json({ error: 'Failed to fetch SMS statistics' });
  }
});

module.exports = router; 