const mongoose = require('mongoose');

const smsSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  address: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['inbox', 'sent', 'draft', 'outbox', 'failed', 'queued', 'unknown'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
smsSchema.index({ deviceId: 1, date: -1 });
smsSchema.index({ deviceId: 1, type: 1 });

module.exports = mongoose.model('SMS', smsSchema); 