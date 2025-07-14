const mongoose = require('mongoose');

const gmailAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  tokenExpiry: {
    type: Date,
    required: true
  },
  collectorEmail: {
    type: String,
    required: true
  },
  forwardingEnabled: {
    type: Boolean,
    default: false
  },
  filterId: {
    type: String,
    default: null
  },
  lastForwardedMessageId: {
    type: String,
    default: null
  },
  totalMessagesForwarded: {
    type: Number,
    default: 0
  },
  lastSyncTime: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
gmailAccountSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to check if token is expired
gmailAccountSchema.methods.isTokenExpired = function() {
  return new Date() > this.tokenExpiry;
};

// Method to get token expiry time in seconds
gmailAccountSchema.methods.getTokenExpirySeconds = function() {
  return Math.floor((this.tokenExpiry - new Date()) / 1000);
};

module.exports = mongoose.model('GmailAccount', gmailAccountSchema); 