const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'dislike'],
    default: 'like'
  }
}, {
  timestamps: true
});

// Compound index to ensure one like per user per video
likeSchema.index({ videoId: 1, userId: 1 }, { unique: true });
likeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Like', likeSchema); 