const express = require('express');
const router = express.Router();
const CaptureVideos = require('../models/CaptureVideos');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/captured');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Get all captured videos for a device
router.get('/device/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { platform, sourceType, limit = 100, offset = 0 } = req.query;
        
        let query = { deviceId, userId: req.user.id };
        if (platform) {
            query.platform = platform;
        }
        if (sourceType) {
            query.sourceType = sourceType;
        }
        
        const videos = await CaptureVideos.find(query)
            .sort({ timestamp: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit));
            
        res.json({
            success: true,
            data: videos,
            count: videos.length
        });
    } catch (error) {
        console.error('Error fetching captured videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch captured videos'
        });
    }
});

// Get videos by platform
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
        
        const videos = await CaptureVideos.getByPlatform(platform, deviceId, parseInt(limit));
        
        res.json({
            success: true,
            data: videos,
            count: videos.length
        });
    } catch (error) {
        console.error('Error fetching platform videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch platform videos'
        });
    }
});

// Get videos by type
router.get('/type/:mimeType', auth, async (req, res) => {
    try {
        const { mimeType } = req.params;
        const { deviceId, limit = 50 } = req.query;
        
        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: 'Device ID is required'
            });
        }
        
        const videos = await CaptureVideos.getByType(mimeType, deviceId, parseInt(limit));
        
        res.json({
            success: true,
            data: videos,
            count: videos.length
        });
    } catch (error) {
        console.error('Error fetching type videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch type videos'
        });
    }
});

// Save a new captured video
router.post('/', auth, async (req, res) => {
    try {
        const {
            deviceId,
            platform,
            sourceType = 'captured',
            title,
            description,
            originalName,
            filename,
            filePath,
            fileSize,
            mimeType,
            duration = 0,
            width = 0,
            height = 0,
            thumbnail,
            thumbnailPath,
            location,
            metadata = {},
            context = {},
            tags = [],
            isPrivate = true,
            isSensitive = false
        } = req.body;
        
        // Validate required fields
        if (!deviceId || !platform || !originalName || !filename || !filePath || !fileSize || !mimeType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const capturedVideo = new CaptureVideos({
            deviceId,
            userId: req.user.id,
            platform,
            sourceType,
            title,
            description,
            originalName,
            filename,
            filePath,
            fileSize,
            mimeType,
            duration,
            width,
            height,
            thumbnail,
            thumbnailPath,
            location,
            metadata,
            context,
            tags,
            isPrivate,
            isSensitive
        });
        
        await capturedVideo.save();
        
        res.status(201).json({
            success: true,
            data: capturedVideo,
            message: 'Video captured successfully'
        });
    } catch (error) {
        console.error('Error saving captured video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save captured video'
        });
    }
});

// Upload captured video file
router.post('/upload', auth, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        
        const {
            deviceId,
            platform,
            sourceType = 'captured',
            title,
            description,
            duration,
            width,
            height,
            location,
            context,
            tags
        } = req.body;
        
        // Validate required fields
        if (!deviceId || !platform) {
            return res.status(400).json({
                success: false,
                message: 'Device ID and platform are required'
            });
        }
        
        const capturedVideo = new CaptureVideos({
            deviceId,
            userId: req.user.id,
            platform,
            sourceType,
            title: title || req.file.originalname,
            description,
            originalName: req.file.originalname,
            filename: req.file.filename,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            duration: duration ? parseInt(duration) : 0,
            width: width ? parseInt(width) : 0,
            height: height ? parseInt(height) : 0,
            location: location ? JSON.parse(location) : null,
            context: context ? JSON.parse(context) : {},
            tags: tags ? JSON.parse(tags) : []
        });
        
        await capturedVideo.save();
        
        res.status(201).json({
            success: true,
            data: capturedVideo,
            message: 'Video uploaded and captured successfully'
        });
    } catch (error) {
        console.error('Error uploading captured video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload captured video'
        });
    }
});

// Bulk save captured videos
router.post('/bulk', auth, async (req, res) => {
    try {
        const { videos } = req.body;
        
        if (!Array.isArray(videos) || videos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Videos array is required'
            });
        }
        
        // Add userId to each video
        const videosWithUserId = videos.map(video => ({
            ...video,
            userId: req.user.id
        }));
        
        const savedVideos = await CaptureVideos.insertMany(videosWithUserId);
        
        res.status(201).json({
            success: true,
            data: savedVideos,
            count: savedVideos.length,
            message: `${savedVideos.length} videos captured successfully`
        });
    } catch (error) {
        console.error('Error saving bulk videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save bulk videos'
        });
    }
});

// Mark video as processed
router.patch('/:videoId/processed', auth, async (req, res) => {
    try {
        const { videoId } = req.params;
        
        const video = await CaptureVideos.findOneAndUpdate(
            { _id: videoId, userId: req.user.id },
            { processed: true },
            { new: true }
        );
        
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }
        
        res.json({
            success: true,
            data: video,
            message: 'Video marked as processed'
        });
    } catch (error) {
        console.error('Error marking video as processed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark video as processed'
        });
    }
});

// Mark video as uploaded
router.patch('/:videoId/uploaded', auth, async (req, res) => {
    try {
        const { videoId } = req.params;
        
        const video = await CaptureVideos.findOneAndUpdate(
            { _id: videoId, userId: req.user.id },
            { uploaded: true, uploadTimestamp: new Date() },
            { new: true }
        );
        
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }
        
        res.json({
            success: true,
            data: video,
            message: 'Video marked as uploaded'
        });
    } catch (error) {
        console.error('Error marking video as uploaded:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark video as uploaded'
        });
    }
});

// Get unprocessed videos
router.get('/unprocessed/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const videos = await CaptureVideos.getUnprocessed(deviceId);
        
        res.json({
            success: true,
            data: videos,
            count: videos.length
        });
    } catch (error) {
        console.error('Error fetching unprocessed videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unprocessed videos'
        });
    }
});

// Get unuploaded videos
router.get('/unuploaded/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const videos = await CaptureVideos.getUnuploaded(deviceId);
        
        res.json({
            success: true,
            data: videos,
            count: videos.length
        });
    } catch (error) {
        console.error('Error fetching unuploaded videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unuploaded videos'
        });
    }
});

// Get statistics
router.get('/stats/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const stats = await CaptureVideos.getStats(deviceId);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching video stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch video statistics'
        });
    }
});

// Get videos by date range
router.get('/daterange/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }
        
        const videos = await CaptureVideos.getByDateRange(
            deviceId,
            new Date(startDate),
            new Date(endDate)
        );
        
        res.json({
            success: true,
            data: videos,
            count: videos.length
        });
    } catch (error) {
        console.error('Error fetching videos by date range:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch videos by date range'
        });
    }
});

// Add tag to video
router.patch('/:videoId/tags', auth, async (req, res) => {
    try {
        const { videoId } = req.params;
        const { tag } = req.body;
        
        if (!tag) {
            return res.status(400).json({
                success: false,
                message: 'Tag is required'
            });
        }
        
        const video = await CaptureVideos.findOne({ _id: videoId, userId: req.user.id });
        
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }
        
        await video.addTag(tag);
        
        res.json({
            success: true,
            data: video,
            message: 'Tag added successfully'
        });
    } catch (error) {
        console.error('Error adding tag to video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add tag to video'
        });
    }
});

// Delete captured video
router.delete('/:videoId', auth, async (req, res) => {
    try {
        const { videoId } = req.params;
        
        const video = await CaptureVideos.findOne({ _id: videoId, userId: req.user.id });
        
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }
        
        // Delete the file if it exists
        if (video.filePath && fs.existsSync(video.filePath)) {
            fs.unlinkSync(video.filePath);
        }
        
        // Delete thumbnail if it exists
        if (video.thumbnailPath && fs.existsSync(video.thumbnailPath)) {
            fs.unlinkSync(video.thumbnailPath);
        }
        
        await CaptureVideos.findByIdAndDelete(videoId);
        
        res.json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete video'
        });
    }
});

// Test endpoint (no auth required)
router.post('/test', async (req, res) => {
    try {
        const {
            deviceId,
            platform,
            sourceType,
            originalName,
            filename,
            filePath,
            fileSize,
            mimeType
        } = req.body;
        
        // Validate required fields
        if (!deviceId || !platform || !originalName || !filename || !filePath || !fileSize || !mimeType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const capturedVideo = new CaptureVideos({
            deviceId,
            userId: '507f1f77bcf86cd799439011', // Test user ID
            platform,
            sourceType: sourceType || 'captured',
            originalName,
            filename,
            filePath,
            fileSize,
            mimeType
        });
        
        await capturedVideo.save();
        
        res.status(201).json({
            success: true,
            data: capturedVideo,
            message: 'Test video captured successfully'
        });
    } catch (error) {
        console.error('Error saving test video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save test video'
        });
    }
});

module.exports = router; 