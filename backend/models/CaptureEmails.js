const mongoose = require('mongoose');

const captureEmailsSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    platform: {
        type: String,
        required: true,
        enum: ['gmail', 'outlook', 'yahoo', 'icloud'],
        default: 'gmail',
        index: true
    },
    accountId: {
        type: String,
        required: true
    },
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    threadId: {
        type: String,
        required: true
    },
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
    body: {
        type: String,
        default: ''
    },
    bodyHtml: {
        type: String,
        default: ''
    },
    snippet: {
        type: String,
        default: ''
    },
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
    isOutgoing: {
        type: Boolean,
        default: false
    },
    labels: [{
        type: String
    }],
    internalDate: {
        type: String,
        required: true
    },
    sizeEstimate: {
        type: Number,
        default: 0
    },
    attachments: [{
        filename: String,
        mimeType: String,
        size: Number,
        attachmentId: String,
        downloaded: {
            type: Boolean,
            default: false
        },
        localPath: String
    }],
    // Additional metadata
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Processing status
    processed: {
        type: Boolean,
        default: false
    },
    uploaded: {
        type: Boolean,
        default: false
    },
    uploadTimestamp: {
        type: Date,
        default: null
    },
    // Forwarding status
    forwarded: {
        type: Boolean,
        default: false
    },
    forwardTimestamp: {
        type: Date,
        default: null
    },
    forwardAddress: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
captureEmailsSchema.index({ deviceId: 1, platform: 1, timestamp: -1 });
captureEmailsSchema.index({ userId: 1, platform: 1, timestamp: -1 });
captureEmailsSchema.index({ accountId: 1, timestamp: -1 });
captureEmailsSchema.index({ from: 1, timestamp: -1 });
captureEmailsSchema.index({ subject: 'text', body: 'text' });
captureEmailsSchema.index({ isRead: 1, timestamp: -1 });
captureEmailsSchema.index({ uploaded: 1, processed: 1 });
captureEmailsSchema.index({ forwarded: 1, timestamp: -1 });

// Static methods
captureEmailsSchema.statics.getByAccount = function(accountId, platform, limit = 100) {
    return this.find({ accountId, platform })
        .sort({ timestamp: -1 })
        .limit(limit);
};

captureEmailsSchema.statics.getBySender = function(from, deviceId, limit = 50) {
    return this.find({ from, deviceId })
        .sort({ timestamp: -1 })
        .limit(limit);
};

captureEmailsSchema.statics.getUnprocessed = function(deviceId) {
    return this.find({ deviceId, processed: false })
        .sort({ timestamp: -1 });
};

captureEmailsSchema.statics.getUnuploaded = function(deviceId) {
    return this.find({ deviceId, uploaded: false })
        .sort({ timestamp: -1 });
};

captureEmailsSchema.statics.getUnforwarded = function(deviceId) {
    return this.find({ deviceId, forwarded: false })
        .sort({ timestamp: -1 });
};

captureEmailsSchema.statics.getStats = function(deviceId) {
    return this.aggregate([
        { $match: { deviceId } },
        {
            $group: {
                _id: '$platform',
                total: { $sum: 1 },
                unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
                read: { $sum: { $cond: [{ $eq: ['$isRead', true] }, 1, 0] } },
                starred: { $sum: { $cond: [{ $eq: ['$isStarred', true] }, 1, 0] } },
                important: { $sum: { $cond: [{ $eq: ['$isImportant', true] }, 1, 0] } },
                outgoing: { $sum: { $cond: [{ $eq: ['$isOutgoing', true] }, 1, 0] } },
                incoming: { $sum: { $cond: [{ $eq: ['$isOutgoing', false] }, 1, 0] } },
                unprocessed: { $sum: { $cond: [{ $eq: ['$processed', false] }, 1, 0] } },
                unuploaded: { $sum: { $cond: [{ $eq: ['$uploaded', false] }, 1, 0] } },
                unforwarded: { $sum: { $cond: [{ $eq: ['$forwarded', false] }, 1, 0] } }
            }
        }
    ]);
};

captureEmailsSchema.statics.getRecentSenders = function(deviceId, limit = 10) {
    return this.aggregate([
        { $match: { deviceId } },
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
captureEmailsSchema.methods.markAsProcessed = function() {
    this.processed = true;
    return this.save();
};

captureEmailsSchema.methods.markAsUploaded = function() {
    this.uploaded = true;
    this.uploadTimestamp = new Date();
    return this.save();
};

captureEmailsSchema.methods.markAsForwarded = function(forwardAddress) {
    this.forwarded = true;
    this.forwardTimestamp = new Date();
    this.forwardAddress = forwardAddress;
    return this.save();
};

captureEmailsSchema.methods.markAsRead = function() {
    this.isRead = true;
    return this.save();
};

captureEmailsSchema.methods.markAsUnread = function() {
    this.isRead = false;
    return this.save();
};

captureEmailsSchema.methods.toggleStar = function() {
    this.isStarred = !this.isStarred;
    return this.save();
};

captureEmailsSchema.methods.toggleImportant = function() {
    this.isImportant = !this.isImportant;
    return this.save();
};

module.exports = mongoose.model('CaptureEmails', captureEmailsSchema); 