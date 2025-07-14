const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  number: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['incoming', 'outgoing', 'missed', 'rejected', 'blocked', 'unknown'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  duration: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    default: ''
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
callLogSchema.index({ deviceId: 1, date: -1 });

module.exports = mongoose.model('CallLog', callLogSchema); 