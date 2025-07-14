const Like = require('../models/Like');
const Video = require('../models/Video');

// Toggle like on video
const toggleVideoLike = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;
    
    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if user already liked the video
    const existingLike = await Like.findOne({ videoId, userId });
    
    if (existingLike) {
      // Unlike the video
      await Like.findByIdAndDelete(existingLike._id);
      
      // Decrement video likes count
      video.likes = Math.max(0, video.likes - 1);
      await video.save();
      
      res.json({ 
        message: 'Video unliked successfully',
        isLiked: false,
        likes: video.likes
      });
    } else {
      // Like the video
      const newLike = new Like({
        videoId,
        userId,
        type: 'like'
      });
      
      await newLike.save();
      
      // Increment video likes count
      video.likes += 1;
      await video.save();
      
      res.json({ 
        message: 'Video liked successfully',
        isLiked: true,
        likes: video.likes
      });
    }
  } catch (error) {
    console.error('Error toggling video like:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user liked a video
const checkVideoLike = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;
    
    const like = await Like.findOne({ videoId, userId });
    
    res.json({ 
      isLiked: !!like,
      likeType: like ? like.type : null
    });
  } catch (error) {
    console.error('Error checking video like:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's liked videos
const getUserLikedVideos = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const likes = await Like.find({ userId, type: 'like' })
      .populate({
        path: 'videoId',
        populate: {
          path: 'userId',
          select: 'username profilePicture'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalLikes = await Like.countDocuments({ userId, type: 'like' });
    
    const videos = likes.map(like => like.videoId).filter(video => video); // Filter out deleted videos
    
    res.json({
      videos,
      totalLikes,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalLikes / limit),
      hasMore: skip + likes.length < totalLikes
    });
  } catch (error) {
    console.error('Error getting user liked videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get video likes count and details
const getVideoLikes = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const likes = await Like.find({ videoId, type: 'like' })
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalLikes = await Like.countDocuments({ videoId, type: 'like' });
    
    res.json({
      likes,
      totalLikes,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalLikes / limit),
      hasMore: skip + likes.length < totalLikes
    });
  } catch (error) {
    console.error('Error getting video likes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  toggleVideoLike,
  checkVideoLike,
  getUserLikedVideos,
  getVideoLikes
}; 