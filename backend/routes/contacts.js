const express = require('express');
const router = express.Router();
const mobileFirebaseService = require('../services/mobileFirebaseService');
const { db } = require('../config/firebase');

// Store contacts directly to Firebase
router.post('/store', async (req, res) => {
  try {
    const { deviceId, contacts, timestamp } = req.body;
    
    if (!deviceId || !contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const result = await mobileFirebaseService.storeContacts({
      deviceId,
      contacts,
      timestamp
    });

    res.status(201).json({
      message: `Stored ${result.count} contacts in Firebase`,
      count: result.count
    });
  } catch (error) {
    console.error('Error storing contacts in Firebase:', error);
    res.status(500).json({ error: 'Failed to store contacts in Firebase' });
  }
});

// Get contacts for a device with pagination from Firebase
router.get('/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { page = 1, limit = 100 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const contactsQuery = await db.collection('contacts')
      .where('deviceId', '==', deviceId)
      .orderBy('name', 'asc')
      .limit(limitNum)
      .offset((pageNum - 1) * limitNum)
      .get();

    const contacts = contactsQuery.docs.map(doc => doc.data());
    
    // Get total count
    const totalQuery = await db.collection('contacts')
      .where('deviceId', '==', deviceId)
      .get();
    
    const totalCount = totalQuery.size;
    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        contacts,
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
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get contacts statistics from Firebase
router.get('/stats', async (req, res) => {
  try {
    const contactsQuery = await db.collection('contacts').get();
    const totalContacts = contactsQuery.size;
    
    // Get unique devices
    const deviceIds = new Set();
    contactsQuery.docs.forEach(doc => {
      deviceIds.add(doc.data().deviceId);
    });
    
    const uniqueDevices = deviceIds.size;
    
    // Get contacts with phone numbers
    const contactsWithPhoneQuery = await db.collection('contacts')
      .where('hasPhone', '==', true)
      .get();
    
    const contactsWithPhone = contactsWithPhoneQuery.size;
    
    res.json({
      success: true,
      data: {
        totalContacts,
        uniqueDevices,
        contactsWithPhone,
        contactsWithoutPhone: totalContacts - contactsWithPhone
      }
    });
  } catch (error) {
    console.error('Error fetching contacts stats:', error);
    res.status(500).json({ error: 'Failed to fetch contacts statistics' });
  }
});

// Delete all contacts from Firebase
router.delete('/all', async (req, res) => {
  try {
    const { deviceId, confirm } = req.body;
    
    // Require confirmation to prevent accidental deletion
    if (confirm !== 'true') {
      return res.status(400).json({ 
        error: 'Confirmation required. Set confirm to "true" to delete all contacts.' 
      });
    }

    let query = db.collection('contacts');
    
    // If deviceId is provided, delete only contacts for that device
    if (deviceId) {
      query = query.where('deviceId', '==', deviceId);
    }

    const contactsQuery = await query.get();
    
    if (contactsQuery.empty) {
      return res.status(404).json({ 
        message: 'No contacts found to delete',
        deletedCount: 0
      });
    }

    // Delete contacts in batches (Firebase batch limit is 500)
    const batchSize = 500;
    const batches = [];
    let deletedCount = 0;

    for (let i = 0; i < contactsQuery.docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = contactsQuery.docs.slice(i, i + batchSize);
      
      batchDocs.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
      });
      
      batches.push(batch);
    }

    // Execute all batches
    await Promise.all(batches.map(batch => batch.commit()));

    res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} contacts`,
      deletedCount,
      deviceId: deviceId || 'all devices'
    });
  } catch (error) {
    console.error('Error deleting contacts:', error);
    res.status(500).json({ error: 'Failed to delete contacts' });
  }
});

// Delete contacts for a specific device
router.delete('/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { confirm } = req.body;
    
    // Require confirmation to prevent accidental deletion
    if (confirm !== 'true') {
      return res.status(400).json({ 
        error: 'Confirmation required. Set confirm to "true" to delete contacts for this device.' 
      });
    }

    const contactsQuery = await db.collection('contacts')
      .where('deviceId', '==', deviceId)
      .get();
    
    if (contactsQuery.empty) {
      return res.status(404).json({ 
        message: `No contacts found for device ${deviceId}`,
        deletedCount: 0
      });
    }

    // Delete contacts in batches
    const batchSize = 500;
    const batches = [];
    let deletedCount = 0;

    for (let i = 0; i < contactsQuery.docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = contactsQuery.docs.slice(i, i + batchSize);
      
      batchDocs.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
      });
      
      batches.push(batch);
    }

    // Execute all batches
    await Promise.all(batches.map(batch => batch.commit()));

    res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} contacts for device ${deviceId}`,
      deletedCount,
      deviceId
    });
  } catch (error) {
    console.error('Error deleting contacts for device:', error);
    res.status(500).json({ error: 'Failed to delete contacts for device' });
  }
});

module.exports = router; 