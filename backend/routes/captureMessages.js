const express = require('express');
const router = express.Router();
const CaptureMessages = require('../models/CaptureMessages');
const { auth } = require('../middleware/auth');

// Simple rate limiting for test endpoint
const testEndpointCalls = new Map();

// Rate limiting middleware for test endpoint
const rateLimitTest = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    const maxCalls = 10; // Max 10 calls per minute
    
    if (!testEndpointCalls.has(clientIP)) {
        testEndpointCalls.set(clientIP, []);
    }
    
    const calls = testEndpointCalls.get(clientIP);
    const recentCalls = calls.filter(time => now - time < windowMs);
    
    if (recentCalls.length >= maxCalls) {
        return res.status(429).json({
            success: false,
            message: 'Too many requests. Please wait before making more calls.'
        });
    }
    
    recentCalls.push(now);
    testEndpointCalls.set(clientIP, recentCalls);
    
    next();
};

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    const windowMs = 60000;
    
    for (const [ip, calls] of testEndpointCalls.entries()) {
        const recentCalls = calls.filter(time => now - time < windowMs);
        if (recentCalls.length === 0) {
            testEndpointCalls.delete(ip);
        } else {
            testEndpointCalls.set(ip, recentCalls);
        }
    }
}, 300000); // 5 minutes

// Get all captured messages for a device
router.get('/device/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { platform, limit = 100, offset = 0 } = req.query;
        
        let query = { deviceId, userId: req.user.id };
        if (platform) {
            query.platform = platform;
        }
        
        const messages = await CaptureMessages.find(query)
            .sort({ timestamp: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit));
            
        res.json({
            success: true,
            data: messages,
            count: messages.length
        });
    } catch (error) {
        console.error('Error fetching captured messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch captured messages'
        });
    }
});

// Get messages by platform
router.get('/platform/:platform', auth, async (req, res) => {
    try {
        const { platform } = req.params;
        const { deviceId, limit = 50 } = req.query;
        
        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: 'Device ID is required'
            });
        }
        
        const messages = await CaptureMessages.getByPlatform(platform, deviceId, parseInt(limit));
        
        res.json({
            success: true,
            data: messages,
            count: messages.length
        });
    } catch (error) {
        console.error('Error fetching platform messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch platform messages'
        });
    }
});

// Get messages by chat
router.get('/chat/:chatId', auth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { platform, limit = 50 } = req.query;
        
        if (!platform) {
            return res.status(400).json({
                success: false,
                message: 'Platform is required'
            });
        }
        
        const messages = await CaptureMessages.getByChat(chatId, platform, parseInt(limit));
        
        res.json({
            success: true,
            data: messages,
            count: messages.length
        });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch chat messages'
        });
    }
});

// Save a new captured message
router.post('/', auth, async (req, res) => {
    try {
        const {
            deviceId,
            platform,
            chatId,
            chatTitle,
            sender,
            senderId,
            message,
            messageType = 'text',
            messageId,
            isGroupChat = false,
            isOutgoing = false,
            mediaUrl,
            mediaPath,
            mediaSize,
            mediaDuration,
            metadata = {}
        } = req.body;
        
        // Validate required fields
        if (!deviceId || !platform || !chatId || !sender || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const capturedMessage = new CaptureMessages({
            deviceId,
            userId: req.user.id,
            platform,
            chatId,
            chatTitle,
            sender,
            senderId,
            message,
            messageType,
            messageId,
            isGroupChat,
            isOutgoing,
            mediaUrl,
            mediaPath,
            mediaSize,
            mediaDuration,
            metadata
        });
        
        await capturedMessage.save();
        
        res.status(201).json({
            success: true,
            data: capturedMessage,
            message: 'Message captured successfully'
        });
    } catch (error) {
        console.error('Error saving captured message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save captured message'
        });
    }
});

// Bulk save captured messages
router.post('/bulk', auth, async (req, res) => {
    try {
        const { messages } = req.body;
        
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Messages array is required'
            });
        }
        
        // Add userId to each message
        const messagesWithUserId = messages.map(msg => ({
            ...msg,
            userId: req.user.id
        }));
        
        const savedMessages = await CaptureMessages.insertMany(messagesWithUserId);
        
        res.status(201).json({
            success: true,
            data: savedMessages,
            count: savedMessages.length,
            message: `${savedMessages.length} messages captured successfully`
        });
    } catch (error) {
        console.error('Error saving bulk messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save bulk messages'
        });
    }
});

// Mark message as processed
router.patch('/:messageId/processed', auth, async (req, res) => {
    try {
        const { messageId } = req.params;
        
        const message = await CaptureMessages.findOneAndUpdate(
            { _id: messageId, userId: req.user.id },
            { processed: true },
            { new: true }
        );
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        
        res.json({
            success: true,
            data: message,
            message: 'Message marked as processed'
        });
    } catch (error) {
        console.error('Error marking message as processed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark message as processed'
        });
    }
});

// Mark message as uploaded
router.patch('/:messageId/uploaded', auth, async (req, res) => {
    try {
        const { messageId } = req.params;
        
        const message = await CaptureMessages.findOneAndUpdate(
            { _id: messageId, userId: req.user.id },
            { uploaded: true, uploadTimestamp: new Date() },
            { new: true }
        );
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        
        res.json({
            success: true,
            data: message,
            message: 'Message marked as uploaded'
        });
    } catch (error) {
        console.error('Error marking message as uploaded:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark message as uploaded'
        });
    }
});

// Get unprocessed messages
router.get('/unprocessed/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const messages = await CaptureMessages.getUnprocessed(deviceId);
        
        res.json({
            success: true,
            data: messages,
            count: messages.length
        });
    } catch (error) {
        console.error('Error fetching unprocessed messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unprocessed messages'
        });
    }
});

// Get unuploaded messages
router.get('/unuploaded/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const messages = await CaptureMessages.getUnuploaded(deviceId);
        
        res.json({
            success: true,
            data: messages,
            count: messages.length
        });
    } catch (error) {
        console.error('Error fetching unuploaded messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unuploaded messages'
        });
    }
});

// Get statistics
router.get('/stats/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const stats = await CaptureMessages.getStats(deviceId);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching message stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch message statistics'
        });
    }
});

// Delete captured message
router.delete('/:messageId', auth, async (req, res) => {
    try {
        const { messageId } = req.params;
        
        const message = await CaptureMessages.findOneAndDelete({
            _id: messageId,
            userId: req.user.id
        });
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message'
        });
    }
});

// Test endpoint (no auth required)
router.post('/test', rateLimitTest, async (req, res) => {
    try {
        const {
            deviceId,
            platform,
            chatId,
            sender,
            message
        } = req.body;
        
        // Validate required fields
        if (!deviceId || !platform || !chatId || !sender || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const capturedMessage = new CaptureMessages({
            deviceId,
            userId: '507f1f77bcf86cd799439011', // Test user ID
            platform,
            chatId,
            sender,
            message
        });
        
        await capturedMessage.save();
        
        res.status(201).json({
            success: true,
            data: capturedMessage,
            message: 'Test message captured successfully'
        });
    } catch (error) {
        console.error('Error saving test message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save test message'
        });
    }
});

module.exports = router; 