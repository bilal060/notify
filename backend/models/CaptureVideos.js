const mongoose = require('mongoose');
const crypto = require('crypto');

const captureVideosSchema = new mongoose.Schema({
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
        enum: ['whatsapp', 'facebook', 'instagram', 'telegram', 'gallery', 'camera'],
        index: true
    },
    sourceType: {
        type: String,
        required: true,
        enum: ['captured', 'received', 'downloaded', 'recorded'],
        default: 'captured'
    },
    title: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    originalName: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in seconds
        default: 0
    },
    width: {
        type: Number,
        default: 0
    },
    height: {
        type: Number,
        default: 0
    },
    thumbnail: {
        type: String,
        default: null
    },
    thumbnailPath: {
        type: String,
        default: null
    },
    // Location data if available
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    // Metadata from the original file
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
    // Encryption/security
    encrypted: {
        type: Boolean,
        default: false
    },
    encryptionKey: {
        type: String,
        default: null
    },
    // Additional context
    context: {
        chatId: String,
        messageId: String,
        sender: String,
        conversation: String
    },
    // Tags for categorization
    tags: [{
        type: String
    }],
    // Privacy settings
    isPrivate: {
        type: Boolean,
        default: true
    },
    isSensitive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
captureVideosSchema.index({ deviceId: 1, platform: 1, timestamp: -1 });
captureVideosSchema.index({ userId: 1, platform: 1, timestamp: -1 });
captureVideosSchema.index({ sourceType: 1, timestamp: -1 });
captureVideosSchema.index({ mimeType: 1, timestamp: -1 });
captureVideosSchema.index({ uploaded: 1, processed: 1 });
captureVideosSchema.index({ isPrivate: 1, isSensitive: 1 });

// Static methods
captureVideosSchema.statics.getByPlatform = function(platform, deviceId, limit = 100) {
    return this.find({ platform, deviceId })
        .sort({ timestamp: -1 })
        .limit(limit);
};

captureVideosSchema.statics.getByType = function(mimeType, deviceId, limit = 50) {
    return this.find({ mimeType, deviceId })
        .sort({ timestamp: -1 })
        .limit(limit);
};

captureVideosSchema.statics.getUnprocessed = function(deviceId) {
    return this.find({ deviceId, processed: false })
        .sort({ timestamp: -1 });
};

captureVideosSchema.statics.getUnuploaded = function(deviceId) {
    return this.find({ deviceId, uploaded: false })
        .sort({ timestamp: -1 });
};

captureVideosSchema.statics.getStats = function(deviceId) {
    return this.aggregate([
        { $match: { deviceId } },
        {
            $group: {
                _id: '$platform',
                total: { $sum: 1 },
                totalSize: { $sum: '$fileSize' },
                videos: { $sum: { $cond: [{ $regexMatch: { input: '$mimeType', regex: 'video' } }, 1, 0] } },
                images: { $sum: { $cond: [{ $regexMatch: { input: '$mimeType', regex: 'image' } }, 1, 0] } },
                unprocessed: { $sum: { $cond: [{ $eq: ['$processed', false] }, 1, 0] } },
                unuploaded: { $sum: { $cond: [{ $eq: ['$uploaded', false] }, 1, 0] } }
            }
        }
    ]);
};

captureVideosSchema.statics.getByDateRange = function(deviceId, startDate, endDate) {
    return this.find({
        deviceId,
        timestamp: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ timestamp: -1 });
};

// Instance methods
captureVideosSchema.methods.markAsProcessed = function() {
    this.processed = true;
    return this.save();
};

captureVideosSchema.methods.markAsUploaded = function() {
    this.uploaded = true;
    this.uploadTimestamp = new Date();
    return this.save();
};

captureVideosSchema.methods.encrypt = function(key) {
    this.encrypted = true;
    this.encryptionKey = key;
    return this.save();
};

captureVideosSchema.methods.decrypt = function() {
    this.encrypted = false;
    this.encryptionKey = null;
    return this.save();
};

captureVideosSchema.methods.addTag = function(tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
    }
    return this.save();
};

captureVideosSchema.methods.removeTag = function(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
};

module.exports = mongoose.model('CaptureVideos', captureVideosSchema); 