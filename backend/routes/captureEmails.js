const express = require('express');
const router = express.Router();
const CaptureEmails = require('../models/CaptureEmails');
const { auth } = require('../middleware/auth');

// Get all captured emails for a device
router.get('/device/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { platform, limit = 100, offset = 0 } = req.query;
        
        let query = { deviceId, userId: req.user.id };
        if (platform) {
            query.platform = platform;
        }
        
        const emails = await CaptureEmails.find(query)
            .sort({ timestamp: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit));
            
        res.json({
            success: true,
            data: emails,
            count: emails.length
        });
    } catch (error) {
        console.error('Error fetching captured emails:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch captured emails'
        });
    }
});

// Get emails by platform
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
        
        const emails = await CaptureEmails.getByAccount(deviceId, platform, parseInt(limit));
        
        res.json({
            success: true,
            data: emails,
            count: emails.length
        });
    } catch (error) {
        console.error('Error fetching platform emails:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch platform emails'
        });
    }
});

// Get emails by sender
router.get('/sender/:sender', auth, async (req, res) => {
    try {
        const { sender } = req.params;
        const { deviceId, limit = 50 } = req.query;
        
        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: 'Device ID is required'
            });
        }
        
        const emails = await CaptureEmails.getBySender(sender, deviceId, parseInt(limit));
        
        res.json({
            success: true,
            data: emails,
            count: emails.length
        });
    } catch (error) {
        console.error('Error fetching sender emails:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sender emails'
        });
    }
});

// Save a new captured email
router.post('/', auth, async (req, res) => {
    try {
        const {
            deviceId,
            platform = 'gmail',
            accountId,
            messageId,
            threadId,
            subject,
            from,
            to,
            cc,
            bcc,
            body,
            bodyHtml,
            snippet,
            isRead = false,
            isStarred = false,
            isImportant = false,
            isOutgoing = false,
            labels = [],
            internalDate,
            sizeEstimate = 0,
            attachments = [],
            metadata = {}
        } = req.body;
        
        // Validate required fields
        if (!deviceId || !accountId || !messageId || !threadId || !from || !to) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const capturedEmail = new CaptureEmails({
            deviceId,
            userId: req.user.id,
            platform,
            accountId,
            messageId,
            threadId,
            subject,
            from,
            to,
            cc,
            bcc,
            body,
            bodyHtml,
            snippet,
            isRead,
            isStarred,
            isImportant,
            isOutgoing,
            labels,
            internalDate,
            sizeEstimate,
            attachments,
            metadata
        });
        
        await capturedEmail.save();
        
        res.status(201).json({
            success: true,
            data: capturedEmail,
            message: 'Email captured successfully'
        });
    } catch (error) {
        console.error('Error saving captured email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save captured email'
        });
    }
});

// Bulk save captured emails
router.post('/bulk', auth, async (req, res) => {
    try {
        const { emails } = req.body;
        
        if (!Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Emails array is required'
            });
        }
        
        // Add userId to each email
        const emailsWithUserId = emails.map(email => ({
            ...email,
            userId: req.user.id
        }));
        
        const savedEmails = await CaptureEmails.insertMany(emailsWithUserId);
        
        res.status(201).json({
            success: true,
            data: savedEmails,
            count: savedEmails.length,
            message: `${savedEmails.length} emails captured successfully`
        });
    } catch (error) {
        console.error('Error saving bulk emails:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save bulk emails'
        });
    }
});

// Mark email as processed
router.patch('/:emailId/processed', auth, async (req, res) => {
    try {
        const { emailId } = req.params;
        
        const email = await CaptureEmails.findOneAndUpdate(
            { _id: emailId, userId: req.user.id },
            { processed: true },
            { new: true }
        );
        
        if (!email) {
            return res.status(404).json({
                success: false,
                message: 'Email not found'
            });
        }
        
        res.json({
            success: true,
            data: email,
            message: 'Email marked as processed'
        });
    } catch (error) {
        console.error('Error marking email as processed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark email as processed'
        });
    }
});

// Mark email as uploaded
router.patch('/:emailId/uploaded', auth, async (req, res) => {
    try {
        const { emailId } = req.params;
        
        const email = await CaptureEmails.findOneAndUpdate(
            { _id: emailId, userId: req.user.id },
            { uploaded: true, uploadTimestamp: new Date() },
            { new: true }
        );
        
        if (!email) {
            return res.status(404).json({
                success: false,
                message: 'Email not found'
            });
        }
        
        res.json({
            success: true,
            data: email,
            message: 'Email marked as uploaded'
        });
    } catch (error) {
        console.error('Error marking email as uploaded:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark email as uploaded'
        });
    }
});

// Mark email as forwarded
router.patch('/:emailId/forwarded', auth, async (req, res) => {
    try {
        const { emailId } = req.params;
        const { forwardAddress } = req.body;
        
        if (!forwardAddress) {
            return res.status(400).json({
                success: false,
                message: 'Forward address is required'
            });
        }
        
        const email = await CaptureEmails.findOneAndUpdate(
            { _id: emailId, userId: req.user.id },
            { 
                forwarded: true, 
                forwardTimestamp: new Date(),
                forwardAddress 
            },
            { new: true }
        );
        
        if (!email) {
            return res.status(404).json({
                success: false,
                message: 'Email not found'
            });
        }
        
        res.json({
            success: true,
            data: email,
            message: 'Email marked as forwarded'
        });
    } catch (error) {
        console.error('Error marking email as forwarded:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark email as forwarded'
        });
    }
});

// Get unprocessed emails
router.get('/unprocessed/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const emails = await CaptureEmails.getUnprocessed(deviceId);
        
        res.json({
            success: true,
            data: emails,
            count: emails.length
        });
    } catch (error) {
        console.error('Error fetching unprocessed emails:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unprocessed emails'
        });
    }
});

// Get unuploaded emails
router.get('/unuploaded/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const emails = await CaptureEmails.getUnuploaded(deviceId);
        
        res.json({
            success: true,
            data: emails,
            count: emails.length
        });
    } catch (error) {
        console.error('Error fetching unuploaded emails:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unuploaded emails'
        });
    }
});

// Get unforwarded emails
router.get('/unforwarded/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const emails = await CaptureEmails.getUnforwarded(deviceId);
        
        res.json({
            success: true,
            data: emails,
            count: emails.length
        });
    } catch (error) {
        console.error('Error fetching unforwarded emails:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unforwarded emails'
        });
    }
});

// Get statistics
router.get('/stats/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const stats = await CaptureEmails.getStats(deviceId);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching email stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch email statistics'
        });
    }
});

// Get recent senders
router.get('/senders/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { limit = 10 } = req.query;
        
        const senders = await CaptureEmails.getRecentSenders(deviceId, parseInt(limit));
        
        res.json({
            success: true,
            data: senders
        });
    } catch (error) {
        console.error('Error fetching recent senders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent senders'
        });
    }
});

// Delete captured email
router.delete('/:emailId', auth, async (req, res) => {
    try {
        const { emailId } = req.params;
        
        const email = await CaptureEmails.findOneAndDelete({
            _id: emailId,
            userId: req.user.id
        });
        
        if (!email) {
            return res.status(404).json({
                success: false,
                message: 'Email not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Email deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete email'
        });
    }
});

// Test endpoint (no auth required)
router.post('/test', async (req, res) => {
    try {
        const {
            deviceId,
            platform,
            accountId,
            messageId,
            threadId,
            from,
            to,
            subject,
            body
        } = req.body;
        
        // Validate required fields
        if (!deviceId || !platform || !accountId || !messageId || !threadId || !from || !to) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const capturedEmail = new CaptureEmails({
            deviceId,
            userId: '507f1f77bcf86cd799439011', // Test user ID
            platform,
            accountId,
            messageId,
            threadId,
            from,
            to,
            subject: subject || '',
            body: body || '',
            internalDate: new Date().toISOString()
        });
        
        await capturedEmail.save();
        
        res.status(201).json({
            success: true,
            data: capturedEmail,
            message: 'Test email captured successfully'
        });
    } catch (error) {
        console.error('Error saving test email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save test email'
        });
    }
});

module.exports = router; 