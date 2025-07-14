const mongoose = require('mongoose');

const phoneNumberSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['home', 'mobile', 'work', 'other', 'unknown'],
    default: 'unknown'
  }
});

const contactSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  contactId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  hasPhone: {
    type: Boolean,
    default: false
  },
  phoneNumbers: [phoneNumberSchema],
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
contactSchema.index({ deviceId: 1, name: 1 });

module.exports = mongoose.model('Contact', contactSchema); 