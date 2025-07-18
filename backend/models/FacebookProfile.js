const mongoose = require('mongoose');

const facebookProfileSchema = new mongoose.Schema({
  profileId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    trim: true,
    index: true
  },
  profilePicture: {
    type: String
  },
  coverPhoto: {
    type: String
  },
  followersCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  postsCount: {
    type: Number,
    default: 0
  },
  about: {
    type: String,
    maxlength: 2000
  },
  location: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  birthday: {
    type: String,
    trim: true
  },
  relationshipStatus: {
    type: String,
    trim: true
  },
  work: {
    type: mongoose.Schema.Types.Mixed
  },
  education: {
    type: mongoose.Schema.Types.Mixed
  },
  extractedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  },
  extractedEmails: [{
    email: String,
    source: String,
    confidence: {
      type: String,
      enum: ['high', 'medium', 'low', 'very_low'],
      default: 'low'
    },
    extractedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastEmailExtraction: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
facebookProfileSchema.index({ profileId: 1, extractedAt: -1 });
facebookProfileSchema.index({ username: 1 });
facebookProfileSchema.index({ name: 1 });
facebookProfileSchema.index({ isActive: 1, extractedAt: -1 });

// Static method to get profile stats
facebookProfileSchema.statics.getProfileStats = async function() {
  try {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalProfiles: { $sum: 1 },
          totalFollowers: { $sum: '$followersCount' },
          totalFollowing: { $sum: '$followingCount' },
          totalPosts: { $sum: '$postsCount' },
          avgFollowers: { $avg: '$followersCount' },
          avgFollowing: { $avg: '$followingCount' }
        }
      }
    ]);

    return stats.length > 0 ? stats[0] : {
      totalProfiles: 0,
      totalFollowers: 0,
      totalFollowing: 0,
      totalPosts: 0,
      avgFollowers: 0,
      avgFollowing: 0
    };
  } catch (error) {
    console.error('Error getting profile stats:', error);
    return {
      totalProfiles: 0,
      totalFollowers: 0,
      totalFollowing: 0,
      totalPosts: 0,
      avgFollowers: 0,
      avgFollowing: 0
    };
  }
};

// Static method to get recent profiles
facebookProfileSchema.statics.getRecentProfiles = async function(limit = 10) {
  try {
    return await this.find({ isActive: true })
      .sort({ extractedAt: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Error getting recent profiles:', error);
    return [];
  }
};

// Static method to search profiles
facebookProfileSchema.statics.searchProfiles = async function(query, limit = 20) {
  try {
    return await this.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { about: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    })
    .sort({ followersCount: -1 })
    .limit(limit);
  } catch (error) {
    console.error('Error searching profiles:', error);
    return [];
  }
};

module.exports = mongoose.model('FacebookProfile', facebookProfileSchema); 