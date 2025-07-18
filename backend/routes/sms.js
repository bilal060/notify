const express = require('express');
const router = express.Router();
const mobileFirebaseService = require('../services/mobileFirebaseService');
const { db } = require('../config/firebase');

// Store SMS messages directly to Firebase
router.post('/store', async (req, res) => {
  try {
    const { deviceId, messages, timestamp } = req.body;
    
    if (!deviceId || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const result = await mobileFirebaseService.storeSMS({
      deviceId,
      messages,
      timestamp
    });

    res.status(201).json({
      message: `Stored ${result.count} SMS messages in Firebase`,
      count: result.count
    });
  } catch (error) {
    console.error('Error storing SMS messages in Firebase:', error);
    res.status(500).json({ error: 'Failed to store SMS messages in Firebase' });
  }
});

// Get SMS messages for a device with pagination from Firebase
router.get('/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { page = 1, limit = 100, type } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let query = db.collection('sms').where('deviceId', '==', deviceId);
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    const messagesQuery = await query
      .orderBy('date', 'desc')
      .limit(limitNum)
      .offset((pageNum - 1) * limitNum)
      .get();

    const messages = messagesQuery.docs.map(doc => doc.data());
    
    // Get total count
    const totalQuery = await query.get();
    const totalCount = totalQuery.size;
    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching SMS messages:', error);
    res.status(500).json({ error: 'Failed to fetch SMS messages' });
  }
});

// Get SMS statistics from Firebase
router.get('/stats', async (req, res) => {
  try {
    const messagesQuery = await db.collection('sms').get();
    const totalMessages = messagesQuery.size;
    
    // Get unique devices
    const deviceIds = new Set();
    const addresses = new Set();
    const messageTypes = {};
    
    messagesQuery.docs.forEach(doc => {
      const data = doc.data();
      deviceIds.add(data.deviceId);
      addresses.add(data.address);
      
      const type = data.type || 'unknown';
      messageTypes[type] = (messageTypes[type] || 0) + 1;
    });
    
    const uniqueDevices = deviceIds.size;
    const uniqueAddresses = addresses.size;
    
    // Convert messageTypes to array format
    const messageTypesArray = Object.entries(messageTypes)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        totalMessages,
        uniqueDevices,
        uniqueAddresses,
        messageTypes: messageTypesArray
      }
    });
  } catch (error) {
    console.error('Error fetching SMS stats:', error);
    res.status(500).json({ error: 'Failed to fetch SMS statistics' });
  }
});

module.exports = router; 