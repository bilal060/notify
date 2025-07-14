const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getUserChats,
  getOrCreateChat,
  sendMessage,
  getChatMessages,
  markMessagesAsRead,
  deleteMessage,
  searchUsersForChat
} = require('../controllers/chatController');

// All routes require authentication
router.use(auth);

// Get user's chats
router.get('/', getUserChats);

// Search users for chat
router.get('/search', searchUsersForChat);

// Get or create chat with user
router.get('/user/:targetUserId', getOrCreateChat);

// Send message
router.post('/message', sendMessage);

// Get messages for a chat
router.get('/:chatId/messages', getChatMessages);

// Mark messages as read
router.put('/read/:senderId', markMessagesAsRead);

// Delete message
router.delete('/message/:messageId', deleteMessage);

module.exports = router; 