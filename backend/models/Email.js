const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  // Gmail account reference
  gmailAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GmailAccount',
    required: true
  },
  
  // Gmail message ID
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Email metadata
  threadId: {
    type: String,
    required: true
  },
  
  // Email headers
  subject: {
    type: String,
    default: ''
  },
  
  from: {
    type: String,
    required: true
  },
  
  to: {
    type: String,
    required: true
  },
  
  cc: {
    type: String,
    default: ''
  },
  
  bcc: {
    type: String,
    default: ''
  },
  
  // Email content
  body: {
    type: String,
    default: ''
  },
  
  bodyHtml: {
    type: String,
    default: ''
  },
  
  // Email status
  isRead: {
    type: Boolean,
    default: false
  },
  
  isStarred: {
    type: Boolean,
    default: false
  },
  
  isImportant: {
    type: Boolean,
    default: false
  },
  
  // Labels
  labels: [{
    type: String
  }],
  
  // Gmail internal date
  internalDate: {
    type: String,
    required: true
  },
  
  // Size estimate
  sizeEstimate: {
    type: Number,
    default: 0
  },
  
  // Snippet
  snippet: {
    type: String,
    default: ''
  },
  
  // Attachments info
  attachments: [{
    filename: String,
    mimeType: String,
    size: Number,
    attachmentId: String
  }],
  
  // Processing status
  processed: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  // Device info (if captured from mobile)
  deviceId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
emailSchema.index({ gmailAccountId: 1, messageId: 1 });
emailSchema.index({ gmailAccountId: 1, timestamp: -1 });
emailSchema.index({ gmailAccountId: 1, isRead: 1 });
emailSchema.index({ gmailAccountId: 1, from: 1 });
emailSchema.index({ gmailAccountId: 1, subject: 'text', body: 'text' });

// Static methods
emailSchema.statics.findByAccount = function(gmailAccountId, options = {}) {
  const { limit = 50, offset = 0, isRead, from, subject } = options;
  
  let query = { gmailAccountId };
  
  if (isRead !== undefined) {
    query.isRead = isRead;
  }
  
  if (from) {
    query.from = { $regex: from, $options: 'i' };
  }
  
  if (subject) {
    query.$text = { $search: subject };
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .skip(offset)
    .limit(limit);
};

emailSchema.statics.getStats = function(gmailAccountId) {
  return this.aggregate([
    { $match: { gmailAccountId: mongoose.Types.ObjectId(gmailAccountId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
        read: { $sum: { $cond: [{ $eq: ['$isRead', true] }, 1, 0] } },
        starred: { $sum: { $cond: [{ $eq: ['$isStarred', true] }, 1, 0] } },
        important: { $sum: { $cond: [{ $eq: ['$isImportant', true] }, 1, 0] } }
      }
    }
  ]);
};

emailSchema.statics.getRecentSenders = function(gmailAccountId, limit = 10) {
  return this.aggregate([
    { $match: { gmailAccountId: mongoose.Types.ObjectId(gmailAccountId) } },
    {
      $group: {
        _id: '$from',
        count: { $sum: 1 },
        lastEmail: { $max: '$timestamp' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

// Instance methods
emailSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

emailSchema.methods.markAsUnread = function() {
  this.isRead = false;
  return this.save();
};

emailSchema.methods.toggleStar = function() {
  this.isStarred = !this.isStarred;
  return this.save();
};

emailSchema.methods.toggleImportant = function() {
  this.isImportant = !this.isImportant;
  return this.save();
};

module.exports = mongoose.model('Email', emailSchema); 