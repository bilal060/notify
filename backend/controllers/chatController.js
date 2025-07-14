const { Message, Chat } = require('../models/Chat');
const User = require('../models/User');

// Get user's chats
const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'username profilePicture')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get unread counts for each chat
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          receiverId: userId,
          senderId: { $in: chat.participants.filter(p => p._id.toString() !== userId) },
          isRead: false
        });
        
        return {
          ...chat.toObject(),
          unreadCount
        };
      })
    );
    
    const totalChats = await Chat.countDocuments({ participants: userId });
    
    res.json({
      chats: chatsWithUnread,
      totalChats,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalChats / limit),
      hasMore: skip + chats.length < totalChats
    });
  } catch (error) {
    console.error('Error getting user chats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get or create chat with user
const getOrCreateChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;
    
    if (userId === targetUserId) {
      return res.status(400).json({ message: 'Cannot chat with yourself' });
    }
    
    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find existing chat
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] }
    }).populate('participants', 'username profilePicture');
    
    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [userId, targetUserId]
      });
      await chat.save();
      
      await chat.populate('participants', 'username profilePicture');
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Error getting or creating chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content, messageType = 'text', mediaUrl } = req.body;
    
    if (!content || !receiverId) {
      return res.status(400).json({ message: 'Content and receiverId are required' });
    }
    
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    
    // Get or create chat
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] }
    });
    
    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId]
      });
      await chat.save();
    }
    
    // Create message
    const message = new Message({
      senderId,
      receiverId,
      content,
      messageType,
      mediaUrl
    });
    
    await message.save();
    
    // Update chat's last message
    chat.lastMessage = message._id;
    chat.lastMessageAt = new Date();
    await chat.save();
    
    // Populate sender info
    await message.populate('senderId', 'username profilePicture');
    await message.populate('receiverId', 'username profilePicture');
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages for a chat
const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Verify user is part of the chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: { $in: chat.participants.filter(p => p.toString() !== userId) } },
        { receiverId: userId, senderId: { $in: chat.participants.filter(p => p.toString() !== userId) } }
      ]
    })
    .populate('senderId', 'username profilePicture')
    .populate('receiverId', 'username profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    const totalMessages = await Message.countDocuments({
      $or: [
        { senderId: userId, receiverId: { $in: chat.participants.filter(p => p.toString() !== userId) } },
        { receiverId: userId, senderId: { $in: chat.participants.filter(p => p.toString() !== userId) } }
      ]
    });
    
    res.json({
      messages: messages.reverse(), // Reverse to get chronological order
      totalMessages,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalMessages / limit),
      hasMore: skip + messages.length < totalMessages
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { senderId } = req.params;
    
    await Message.updateMany(
      {
        senderId,
        receiverId: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is the sender
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    
    await Message.findByIdAndDelete(messageId);
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users for chat
const searchUsersForChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }
    
    const users = await User.find({
      $and: [
        { _id: { $ne: userId } },
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { displayName: { $regex: query, $options: 'i' } },
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username displayName firstName lastName profilePicture')
    .limit(20);
    
    res.json(users);
  } catch (error) {
    console.error('Error searching users for chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserChats,
  getOrCreateChat,
  sendMessage,
  getChatMessages,
  markMessagesAsRead,
  deleteMessage,
  searchUsersForChat
}; 