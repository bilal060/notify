const mongoose = require('mongoose');

const whatsAppSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    messages: [{
        sender: String,
        message: String,
        timestamp: Date,
        chatType: String
    }],
    contacts: [{
        name: String,
        phone: String,
        email: String
    }],
    businessData: [{
        businessName: String,
        phone: String,
        email: String,
        category: String
    }],
    harvestType: {
        type: String,
        default: 'whatsapp'
    }
}, {
    timestamps: true
});

// Index for efficient queries
whatsAppSchema.index({ deviceId: 1, timestamp: -1 });
whatsAppSchema.index({ harvestType: 1 });

module.exports = mongoose.model('WhatsApp', whatsAppSchema); 