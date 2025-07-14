const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'unknown'],
    default: 'unknown'
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
mediaSchema.index({ deviceId: 1, uploadDate: -1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ uploadDate: -1 });

// Static method to get device stats
mediaSchema.statics.getDeviceStats = async function(deviceId) {
  try {
    const stats = await this.aggregate([
      { $match: { deviceId: deviceId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalSize: { $sum: '$size' },
          images: { $sum: { $cond: [{ $eq: ['$type', 'image'] }, 1, 0] } },
          videos: { $sum: { $cond: [{ $eq: ['$type', 'video'] }, 1, 0] } }
        }
      }
    ]);

    return stats.length > 0 ? stats[0] : {
      total: 0,
      totalSize: 0,
      images: 0,
      videos: 0
    };
  } catch (error) {
    console.error('Error getting device stats:', error);
    return {
      total: 0,
      totalSize: 0,
      images: 0,
      videos: 0
    };
  }
};

// Static method to get recent media
mediaSchema.statics.getRecentMedia = async function(deviceId, limit = 10) {
  try {
    return await this.find({ deviceId: deviceId })
      .sort({ uploadDate: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Error getting recent media:', error);
    return [];
  }
};

module.exports = mongoose.model('Media', mediaSchema); 