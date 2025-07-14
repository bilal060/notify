const mongoose = require('mongoose');
const crypto = require('crypto');

const videoSchema = new mongoose.Schema({
  title: {
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
  category: {
    type: String,
    required: true,
    enum: ['Cartoons', 'Sports', 'Funny', 'Nature', 'Technology']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  thumbnail: {
    type: String,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  shareCode: {
    type: String,
    unique: true,
    sparse: true
  },
  shareExpiry: {
    type: Date,
    default: null
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
videoSchema.index({ category: 1, uploadDate: -1 });
videoSchema.index({ userId: 1, uploadDate: -1 });
videoSchema.index({ deviceId: 1, uploadDate: -1 });
videoSchema.index({ shareCode: 1 });

// Generate share code
videoSchema.methods.generateShareCode = function() {
  this.shareCode = crypto.randomBytes(16).toString('hex');
  // Set expiry to 24 hours from now
  this.shareExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return this.shareCode;
};

// Check if share code is valid
videoSchema.methods.isShareCodeValid = function() {
  if (!this.shareCode || !this.shareExpiry) return false;
  return new Date() < this.shareExpiry;
};

// Increment views
videoSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to get videos by category
videoSchema.statics.getByCategory = function(category, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ category, isPublic: true })
    .populate('userId', 'username profilePicture')
    .sort({ uploadDate: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get user videos
videoSchema.statics.getUserVideos = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ userId })
    .sort({ uploadDate: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get video by share code
videoSchema.statics.getByShareCode = function(shareCode) {
  return this.findOne({ 
    shareCode, 
    shareExpiry: { $gt: new Date() },
    isPublic: true 
  }).populate('userId', 'username profilePicture');
};

module.exports = mongoose.model('Video', videoSchema); 