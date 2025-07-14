const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, {
  timestamps: true
});

// Indexes for better query performance
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isRead: 1 });
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });

// Create a compound index for participants to ensure uniqueness
chatSchema.index({ participants: 1 }, { unique: true });

// Populate sender info when converting to JSON
messageSchema.methods.toJSON = function() {
  const message = this.toObject();
  if (this.populated('senderId')) {
    message.sender = {
      _id: message.senderId._id,
      username: message.senderId.username,
      profilePicture: message.senderId.profilePicture
    };
    delete message.senderId;
  }
  if (this.populated('receiverId')) {
    message.receiver = {
      _id: message.receiverId._id,
      username: message.receiverId.username,
      profilePicture: message.receiverId.profilePicture
    };
    delete message.receiverId;
  }
  return message;
};

const Message = mongoose.model('Message', messageSchema);
const Chat = mongoose.model('Chat', chatSchema);

module.exports = { Message, Chat }; 