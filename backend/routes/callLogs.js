const express = require('express');
const router = express.Router();
const CallLog = require('../models/CallLog');

// Store call logs
router.post('/store', async (req, res) => {
  try {
    const { deviceId, callLogs, timestamp } = req.body;
    
    if (!deviceId || !callLogs || !Array.isArray(callLogs)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Store each call log entry
    const savedCallLogs = [];
    for (const callLog of callLogs) {
      const newCallLog = new CallLog({
        deviceId,
        number: callLog.number,
        type: callLog.type,
        date: new Date(callLog.date),
        duration: callLog.duration,
        name: callLog.name,
        timestamp: new Date(timestamp)
      });
      
      const saved = await newCallLog.save();
      savedCallLogs.push(saved);
    }

    res.status(201).json({
      message: `Stored ${savedCallLogs.length} call logs`,
      count: savedCallLogs.length
    });
  } catch (error) {
    console.error('Error storing call logs:', error);
    res.status(500).json({ error: 'Failed to store call logs' });
  }
});

// Get call logs for a device
router.get('/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    const callLogs = await CallLog.find({ deviceId })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await CallLog.countDocuments({ deviceId });
    
    res.json({
      callLogs,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
});

// Get call logs statistics
router.get('/stats', async (req, res) => {
  try {
    const totalCallLogs = await CallLog.countDocuments();
    const uniqueDevices = await CallLog.distinct('deviceId').countDocuments();
    
    // Get call types distribution
    const callTypes = await CallLog.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalCallLogs,
      uniqueDevices,
      callTypes
    });
  } catch (error) {
    console.error('Error fetching call logs stats:', error);
    res.status(500).json({ error: 'Failed to fetch call logs statistics' });
  }
});

module.exports = router; 