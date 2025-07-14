const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  thumbnail: {
    type: String,
    default: null
  },
  videos: [{
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  totalVideos: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number, // in seconds
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
playlistSchema.index({ userId: 1, createdAt: -1 });
playlistSchema.index({ isPublic: 1, createdAt: -1 });
playlistSchema.index({ 'videos.videoId': 1 });

// Update total videos count
playlistSchema.methods.updateVideoCount = function() {
  this.totalVideos = this.videos.length;
  return this.save();
};

// Add video to playlist
playlistSchema.methods.addVideo = function(videoId) {
  const existingVideo = this.videos.find(v => v.videoId.toString() === videoId.toString());
  if (!existingVideo) {
    this.videos.push({
      videoId,
      order: this.videos.length
    });
    this.totalVideos = this.videos.length;
  }
  return this.save();
};

// Remove video from playlist
playlistSchema.methods.removeVideo = function(videoId) {
  this.videos = this.videos.filter(v => v.videoId.toString() !== videoId.toString());
  // Reorder remaining videos
  this.videos.forEach((video, index) => {
    video.order = index;
  });
  this.totalVideos = this.videos.length;
  return this.save();
};

// Populate user info when converting to JSON
playlistSchema.methods.toJSON = function() {
  const playlist = this.toObject();
  if (this.populated('userId')) {
    playlist.user = {
      _id: playlist.userId._id,
      username: playlist.userId.username,
      profilePicture: playlist.userId.profilePicture
    };
    delete playlist.userId;
  }
  return playlist;
};

module.exports = mongoose.model('Playlist', playlistSchema); 