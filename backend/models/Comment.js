const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
commentSchema.index({ videoId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1 });

// Populate user info when converting to JSON
commentSchema.methods.toJSON = function() {
  const comment = this.toObject();
  if (this.populated('userId')) {
    comment.user = {
      _id: comment.userId._id,
      username: comment.userId.username,
      profilePicture: comment.userId.profilePicture
    };
    delete comment.userId;
  }
  return comment;
};

module.exports = mongoose.model('Comment', commentSchema); 