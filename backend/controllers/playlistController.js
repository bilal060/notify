const Playlist = require('../models/Playlist');
const Video = require('../models/Video');

// Create playlist
const createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic = true } = req.body;
    const userId = req.user.id;
    
    if (!name) {
      return res.status(400).json({ message: 'Playlist name is required' });
    }
    
    const playlist = new Playlist({
      name,
      description,
      userId,
      isPublic
    });
    
    await playlist.save();
    
    await playlist.populate('userId', 'username profilePicture');
    
    res.status(201).json(playlist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's playlists
const getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const playlists = await Playlist.find({ userId })
      .populate('userId', 'username profilePicture')
      .populate('videos.videoId', 'title thumbnail duration views')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalPlaylists = await Playlist.countDocuments({ userId });
    
    res.json({
      playlists,
      totalPlaylists,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalPlaylists / limit),
      hasMore: skip + playlists.length < totalPlaylists
    });
  } catch (error) {
    console.error('Error getting user playlists:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get public playlists by user
const getPublicPlaylistsByUser = async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * limit;
    
    // First get the user
    const User = require('../models/User');
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const playlists = await Playlist.find({ 
      userId: user._id, 
      isPublic: true 
    })
    .populate('userId', 'username profilePicture')
    .populate('videos.videoId', 'title thumbnail duration views')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    const totalPlaylists = await Playlist.countDocuments({ 
      userId: user._id, 
      isPublic: true 
    });
    
    res.json({
      playlists,
      totalPlaylists,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalPlaylists / limit),
      hasMore: skip + playlists.length < totalPlaylists
    });
  } catch (error) {
    console.error('Error getting public playlists by user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get playlist by ID
const getPlaylistById = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user.id;
    
    const playlist = await Playlist.findById(playlistId)
      .populate('userId', 'username profilePicture')
      .populate('videos.videoId', 'title description thumbnail duration views likes');
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if user can access the playlist
    if (!playlist.isPublic && playlist.userId._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(playlist);
  } catch (error) {
    console.error('Error getting playlist by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update playlist
const updatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { name, description, isPublic } = req.body;
    const userId = req.user.id;
    
    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if user owns the playlist
    if (playlist.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to edit this playlist' });
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('userId', 'username profilePicture')
    .populate('videos.videoId', 'title thumbnail duration views');
    
    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete playlist
const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user.id;
    
    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if user owns the playlist
    if (playlist.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this playlist' });
    }
    
    await Playlist.findByIdAndDelete(playlistId);
    
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add video to playlist
const addVideoToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { videoId } = req.body;
    const userId = req.user.id;
    
    if (!videoId) {
      return res.status(400).json({ message: 'Video ID is required' });
    }
    
    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if user owns the playlist
    if (playlist.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }
    
    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    await playlist.addVideo(videoId);
    
    const updatedPlaylist = await Playlist.findById(playlistId)
      .populate('userId', 'username profilePicture')
      .populate('videos.videoId', 'title thumbnail duration views');
    
    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error adding video to playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove video from playlist
const removeVideoFromPlaylist = async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;
    const userId = req.user.id;
    
    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if user owns the playlist
    if (playlist.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }
    
    await playlist.removeVideo(videoId);
    
    const updatedPlaylist = await Playlist.findById(playlistId)
      .populate('userId', 'username profilePicture')
      .populate('videos.videoId', 'title thumbnail duration views');
    
    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error removing video from playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reorder videos in playlist
const reorderPlaylistVideos = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { videoOrder } = req.body; // Array of video IDs in new order
    const userId = req.user.id;
    
    if (!videoOrder || !Array.isArray(videoOrder)) {
      return res.status(400).json({ message: 'Video order array is required' });
    }
    
    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if user owns the playlist
    if (playlist.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }
    
    // Reorder videos
    playlist.videos = videoOrder.map((videoId, index) => ({
      videoId,
      order: index,
      addedAt: playlist.videos.find(v => v.videoId.toString() === videoId)?.addedAt || new Date()
    }));
    
    await playlist.save();
    
    const updatedPlaylist = await Playlist.findById(playlistId)
      .populate('userId', 'username profilePicture')
      .populate('videos.videoId', 'title thumbnail duration views');
    
    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error reordering playlist videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPublicPlaylistsByUser,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  reorderPlaylistVideos
}; 