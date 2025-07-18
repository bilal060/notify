const Video = require('../models/Video');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Get videos with pagination
const getVideos = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const totalVideos = await Video.countDocuments(query);
    
    // Get videos with pagination
    const videos = await Video.find(query)
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(totalVideos / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalVideos,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ success: false, message: 'Error fetching videos' });
  }
};

// Get videos by category with pagination
const getVideosByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const totalVideos = await Video.countDocuments({ category });
    
    // Get videos with pagination
    const videos = await Video.find({ category })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(totalVideos / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalVideos,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching videos by category:', error);
    res.status(500).json({ success: false, message: 'Error fetching videos by category' });
  }
};

// Get all available categories
const getCategories = async (req, res) => {
  try {
    const categories = await Video.distinct('category');
    res.json({
      success: true,
      data: categories.filter(category => category && category.trim() !== '')
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Error fetching categories' });
  }
};

// Get single video
const getVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id).populate('userId', 'username');
    
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.json({ success: true, data: video });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ success: false, message: 'Error fetching video' });
  }
};

// Upload video
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded' });
    }

    const { title, description, category } = req.body;
    const userId = req.user.id;

    const video = new Video({
      title,
      description,
      category,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      userId,
      deviceId: req.user.deviceId
    });

    await video.save();
    res.status(201).json({ success: true, data: video });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ success: false, message: 'Error uploading video' });
  }
};

// Like/Unlike video
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Check if user already liked the video
    const userLiked = video.likedBy.includes(userId);
    
    if (userLiked) {
      // Unlike
      video.likes -= 1;
      video.likedBy = video.likedBy.filter(id => id.toString() !== userId);
    } else {
      // Like
      video.likes += 1;
      video.likedBy.push(userId);
    }

    await video.save();
    res.json({ success: true, data: { likes: video.likes, liked: !userLiked } });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, message: 'Error toggling like' });
  }
};

// Generate sharing code
const generateSharingCode = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Check if user owns the video
    if (video.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Generate unique sharing code
    const sharingCode = uuidv4().substring(0, 8);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    video.sharingCode = sharingCode;
    video.sharingExpiresAt = expiresAt;
    await video.save();

    res.json({
      success: true,
      data: {
        sharingCode,
        expiresAt,
        sharingUrl: `${req.protocol}://${req.get('host')}/api/videos/share/${sharingCode}`
      }
    });
  } catch (error) {
    console.error('Error generating sharing code:', error);
    res.status(500).json({ success: false, message: 'Error generating sharing code' });
  }
};

// Access shared video
const accessSharedVideo = async (req, res) => {
  try {
    const { code } = req.params;

    const video = await Video.findOne({
      sharingCode: code,
      sharingExpiresAt: { $gt: new Date() }
    }).populate('userId', 'username');

    if (!video) {
      return res.status(404).json({ success: false, message: 'Invalid or expired sharing code' });
    }

    res.json({ success: true, data: video });
  } catch (error) {
    console.error('Error accessing shared video:', error);
    res.status(500).json({ success: false, message: 'Error accessing shared video' });
  }
};

// Delete video
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Check if user owns the video
    if (video.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete file from filesystem
    if (fs.existsSync(video.filePath)) {
      fs.unlinkSync(video.filePath);
    }

    await Video.findByIdAndDelete(id);
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ success: false, message: 'Error deleting video' });
  }
};

// Search videos with pagination
const searchVideos = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const query = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    };

    // Get total count for pagination
    const totalVideos = await Video.countDocuments(query);
    
    // Get videos with pagination
    const videos = await Video.find(query)
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(totalVideos / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalVideos,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        },
        searchQuery: q
      }
    });
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({ success: false, message: 'Error searching videos' });
  }
};

module.exports = {
  getVideos,
  getVideosByCategory,
  getCategories,
  getVideo,
  uploadVideo,
  toggleLike,
  generateSharingCode,
  accessSharedVideo,
  deleteVideo,
  searchVideos
}; 