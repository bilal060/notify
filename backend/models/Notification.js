const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  body: {
    type: String,
    maxlength: 1000
  },
  appName: {
    type: String,
    required: true
  },
  packageName: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    language: String,
    screenResolution: String,
    timezone: String
  },
  notificationData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['social', 'email', 'messaging', 'news', 'shopping', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['high', 'normal', 'low'],
    default: 'normal'
  },
  source: {
    type: String,
    enum: ['mobile', 'web', 'desktop'],
    default: 'mobile'
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ deviceId: 1, timestamp: -1 });
notificationSchema.index({ deviceId: 1, isRead: 1 });
notificationSchema.index({ timestamp: -1 });

// Virtual for formatted timestamp
notificationSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toLocaleString();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Static method to get unread count for device
notificationSchema.statics.getUnreadCount = function(deviceId) {
  return this.countDocuments({ deviceId: deviceId, isRead: false });
};

// Static method to get notifications by device with pagination
notificationSchema.statics.getDeviceNotifications = function(deviceId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ deviceId: deviceId })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Notification', notificationSchema); 