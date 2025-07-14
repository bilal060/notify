const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/videos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|mkv|wmv|flv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

// Public routes
router.get('/', videoController.getVideos); // Get all videos with pagination
router.get('/search', videoController.searchVideos); // Search videos with pagination
router.get('/category/:category', videoController.getVideosByCategory); // Get videos by category with pagination
router.get('/:id', videoController.getVideo); // Get single video
router.get('/share/:code', videoController.accessSharedVideo); // Access shared video

// Serve video files
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Video file not found' });
  }
});

// Serve video files from subdirectories
router.get('/uploads/:category/:filename', (req, res) => {
  const { category, filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', category, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Video file not found' });
  }
});

// Protected routes (require authentication)
router.post('/upload', auth, upload.single('video'), videoController.uploadVideo); // Upload video
router.post('/:id/like', auth, videoController.toggleLike); // Like/Unlike video
router.post('/:id/share', auth, videoController.generateSharingCode); // Generate sharing code
router.delete('/:id', auth, videoController.deleteVideo); // Delete video

module.exports = router; 