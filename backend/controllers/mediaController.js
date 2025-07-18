const Media = require('../models/Media');
const mobileFirebaseService = require('../services/mobileFirebaseService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and videos
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|mkv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'));
    }
  }
});

// Upload media file
const uploadMedia = async (req, res) => {
  try {
    // Use multer middleware
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      const { deviceId, metadata } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Validate required fields
      if (!deviceId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Determine file type
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const isImage = /\.(jpg|jpeg|png|gif)$/.test(fileExtension);
      const isVideo = /\.(mp4|avi|mov|mkv|webm)$/.test(fileExtension);

      let mediaType = 'unknown';
      if (isImage) mediaType = 'image';
      else if (isVideo) mediaType = 'video';

      // Store media directly to Firebase
      const result = await mobileFirebaseService.storeMedia({
        deviceId,
        file,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });

      console.log(`Media uploaded to Firebase for device ${deviceId}: ${file.originalname}`);

      res.status(201).json({
        success: true,
        message: 'Media uploaded successfully to Firebase',
        data: {
          firebaseId: result.firebaseId,
          downloadUrl: result.downloadUrl,
          filename: file.filename
        }
      });
    });

  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload media'
    });
  }
};

// Get all media
const getAllMedia = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const deviceId = req.query.deviceId;
    const type = req.query.type;

    // Build query
    const query = {};
    if (deviceId) query.deviceId = deviceId;
    if (type) query.type = type;

    // Get media
    const skip = (page - 1) * limit;
    const media = await Media.find(query)
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalMedia = await Media.countDocuments(query);

    res.json({
      success: true,
      data: {
        media,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMedia / limit),
          totalItems: totalMedia,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get all media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get media'
    });
  }
};

// Get device media
const getDeviceMedia = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;

    // Build query
    const query = { deviceId };
    if (type) query.type = type;

    // Get media
    const skip = (page - 1) * limit;
    const media = await Media.find(query)
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalMedia = await Media.countDocuments(query);

    res.json({
      success: true,
      data: {
        media,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMedia / limit),
          totalItems: totalMedia,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get device media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get device media'
    });
  }
};

// Get media statistics
const getMediaStats = async (req, res) => {
  try {
    console.log('Getting media stats...');
    const deviceId = req.query.deviceId;

    // Build query
    const query = {};
    if (deviceId) query.deviceId = deviceId;

    console.log('Media query:', query);

    // Get total media
    const totalMedia = await Media.countDocuments(query);
    console.log('Total media count:', totalMedia);

    // Get media by type
    const typeStats = await Media.aggregate([
      { $match: query },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('Type stats:', typeStats);

    // Get total size
    const sizeStats = await Media.aggregate([
      { $match: query },
      { $group: { _id: null, totalSize: { $sum: '$size' } } }
    ]);

    const totalSize = sizeStats.length > 0 ? sizeStats[0].totalSize : 0;
    console.log('Total size:', totalSize);

    // Get recent uploads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUploads = await Media.countDocuments({
      ...query,
      uploadDate: { $gte: sevenDaysAgo }
    });

    // Get today's uploads
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayUploads = await Media.countDocuments({
      ...query,
      uploadDate: { $gte: today }
    });

    // Format stats
    const stats = {
      totalMedia,
      totalSize,
      recentUploads,
      todayUploads,
      images: 0,
      videos: 0
    };

    // Add type-specific counts
    typeStats.forEach(type => {
      if (type._id === 'image') stats.images = type.count;
      else if (type._id === 'video') stats.videos = type.count;
    });

    console.log('Final stats:', stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get media stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get media statistics',
      error: error.message
    });
  }
};

module.exports = {
  uploadMedia,
  getAllMedia,
  getDeviceMedia,
  getMediaStats
}; 