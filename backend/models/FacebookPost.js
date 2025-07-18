const mongoose = require('mongoose');

const facebookPostSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  profileId: {
    type: String,
    required: true,
    index: true
  },
  message: {
    type: String,
    maxlength: 10000
  },
  createdTime: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['status', 'photo', 'video', 'link', 'share', 'event', 'note'],
    default: 'status'
  },
  permalinkUrl: {
    type: String,
    trim: true
  },
  reactionsCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  sharesCount: {
    type: Number,
    default: 0
  },
  attachments: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  extractedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  isSensitive: {
    type: Boolean,
    default: false,
    index: true
  },
  isBusinessRelated: {
    type: Boolean,
    default: false,
    index: true
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
facebookPostSchema.index({ postId: 1, extractedAt: -1 });
facebookPostSchema.index({ profileId: 1, createdTime: -1 });
facebookPostSchema.index({ type: 1, createdTime: -1 });
facebookPostSchema.index({ isSensitive: 1, extractedAt: -1 });
facebookPostSchema.index({ isBusinessRelated: 1, extractedAt: -1 });

// Static method to get post stats
facebookPostSchema.statics.getPostStats = async function() {
  try {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalReactions: { $sum: '$reactionsCount' },
          totalComments: { $sum: '$commentsCount' },
          totalShares: { $sum: '$sharesCount' },
          avgReactions: { $avg: '$reactionsCount' },
          avgComments: { $avg: '$commentsCount' },
          avgShares: { $avg: '$sharesCount' }
        }
      }
    ]);

    return stats.length > 0 ? stats[0] : {
      totalPosts: 0,
      totalReactions: 0,
      totalComments: 0,
      totalShares: 0,
      avgReactions: 0,
      avgComments: 0,
      avgShares: 0
    };
  } catch (error) {
    console.error('Error getting post stats:', error);
    return {
      totalPosts: 0,
      totalReactions: 0,
      totalComments: 0,
      totalShares: 0,
      avgReactions: 0,
      avgComments: 0,
      avgShares: 0
    };
  }
};

// Static method to get posts by type
facebookPostSchema.statics.getPostsByType = async function(type, limit = 20) {
  try {
    return await this.find({ type: type })
      .sort({ createdTime: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Error getting posts by type:', error);
    return [];
  }
};

// Static method to get sensitive posts
facebookPostSchema.statics.getSensitivePosts = async function(limit = 20) {
  try {
    return await this.find({ isSensitive: true })
      .sort({ extractedAt: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Error getting sensitive posts:', error);
    return [];
  }
};

// Static method to get business related posts
facebookPostSchema.statics.getBusinessPosts = async function(limit = 20) {
  try {
    return await this.find({ isBusinessRelated: true })
      .sort({ extractedAt: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Error getting business posts:', error);
    return [];
  }
};

// Static method to search posts
facebookPostSchema.statics.searchPosts = async function(query, limit = 20) {
  try {
    return await this.find({
      message: { $regex: query, $options: 'i' }
    })
    .sort({ createdTime: -1 })
    .limit(limit);
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
};

// Static method to get posts by profile
facebookPostSchema.statics.getPostsByProfile = async function(profileId, limit = 50) {
  try {
    return await this.find({ profileId: profileId })
      .sort({ createdTime: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Error getting posts by profile:', error);
    return [];
  }
};

module.exports = mongoose.model('FacebookPost', facebookPostSchema); 