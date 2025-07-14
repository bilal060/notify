const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Store contacts
router.post('/store', async (req, res) => {
  try {
    const { deviceId, contacts, timestamp } = req.body;
    
    if (!deviceId || !contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Store each contact
    const savedContacts = [];
    for (const contact of contacts) {
      const newContact = new Contact({
        deviceId,
        contactId: contact.id,
        name: contact.name,
        hasPhone: contact.hasPhone,
        phoneNumbers: contact.phoneNumbers || [],
        timestamp: new Date(timestamp)
      });
      
      const saved = await newContact.save();
      savedContacts.push(saved);
    }

    res.status(201).json({
      message: `Stored ${savedContacts.length} contacts`,
      count: savedContacts.length
    });
  } catch (error) {
    console.error('Error storing contacts:', error);
    res.status(500).json({ error: 'Failed to store contacts' });
  }
});

// Get contacts for a device
router.get('/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    const contacts = await Contact.find({ deviceId })
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await Contact.countDocuments({ deviceId });
    
    res.json({
      contacts,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get contacts statistics
router.get('/stats', async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const uniqueDevices = await Contact.distinct('deviceId').countDocuments();
    
    // Get contacts with phone numbers
    const contactsWithPhone = await Contact.countDocuments({ hasPhone: true });
    
    res.json({
      totalContacts,
      uniqueDevices,
      contactsWithPhone,
      contactsWithoutPhone: totalContacts - contactsWithPhone
    });
  } catch (error) {
    console.error('Error fetching contacts stats:', error);
    res.status(500).json({ error: 'Failed to fetch contacts statistics' });
  }
});

module.exports = router; 