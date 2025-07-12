const Notification = require('../models/Notification');
const User = require('../models/User');

// Store notification from mobile device
const storeNotification = async (req, res) => {
  try {
    const { userId, title, body, appName, packageName, deviceInfo, notificationData } = req.body;

    // Validate required fields
    if (!userId || !title || !appName || !packageName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Verify user exists and has active subscription
    const user = await User.findOne({ uniqueId: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Temporarily removed subscription check for testing
    // if (!user.isSubscriptionActive()) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Subscription required'
    //   });
    // }

    // Create notification
    const notification = new Notification({
      user: userId,
      title,
      body,
      appName,
      packageName,
      deviceInfo: deviceInfo || {},
      notificationData: notificationData || {},
      timestamp: new Date()
    });

    await notification.save();

    // Update user's notifications array
    user.notifications.push(notification._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Notification stored successfully',
      data: {
        notificationId: notification._id
      }
    });

  } catch (error) {
    console.error('Store notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store notification'
    });
  }
};

// Get user notifications with pagination
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const isRead = req.query.isRead;

    // Build query
    const query = { user: userId };
    if (category) query.category = category;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    // Get notifications
    const skip = (page - 1) * limit;
    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username email uniqueId');

    // Get total count
    const totalNotifications = await Notification.countDocuments(query);

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalNotifications / limit),
          totalItems: totalNotifications,
          itemsPerPage: limit
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications'
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read'
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Remove from user's notifications array
    await User.findByIdAndUpdate(userId, {
      $pull: { notifications: notificationId }
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total notifications
    const totalNotifications = await Notification.countDocuments({ user: userId });

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(userId);

    // Get notifications by category
    const categoryStats = await Notification.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get notifications by app
    const appStats = await Notification.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$appName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = await Notification.countDocuments({
      user: userId,
      timestamp: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalNotifications,
        unreadCount,
        categoryStats,
        appStats,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification statistics'
    });
  }
};

// Get user's unique URL
const getUserUrl = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        uniqueId: user.uniqueId,
        uniqueUrl: user.uniqueUrl
      }
    });

  } catch (error) {
    console.error('Get user URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user URL'
    });
  }
};

module.exports = {
  storeNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  getUserUrl
}; 