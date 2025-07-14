const Notification = require('../models/Notification');

// Store notification from mobile device
const storeNotification = async (req, res) => {
  try {
    const { deviceId, title, body, appName, packageName, deviceInfo, notificationData } = req.body;

    // Validate required fields
    if (!deviceId || !title || !appName || !packageName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create notification
    const notification = new Notification({
      deviceId,
      title,
      body,
      appName,
      packageName,
      deviceInfo: deviceInfo || {},
      notificationData: notificationData || {},
      timestamp: new Date()
    });

    await notification.save();

    console.log(`Notification stored for device ${deviceId}: ${title}`);

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

// Get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const deviceId = req.query.deviceId;

    // Build query
    const query = {};
    if (deviceId) query.deviceId = deviceId;

    // Get notifications
    const skip = (page - 1) * limit;
    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalNotifications = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalNotifications / limit),
          totalItems: totalNotifications,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications'
    });
  }
};

// Get device notifications with pagination
const getDeviceNotifications = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const isRead = req.query.isRead;

    // Build query
    const query = { deviceId };
    if (category) query.category = category;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    // Get notifications
    const skip = (page - 1) * limit;
    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalNotifications = await Notification.countDocuments(query);

    // Get unread count
    const unreadCount = await Notification.countDocuments({ deviceId, isRead: false });

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
    console.error('Get device notifications error:', error);
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
    const { deviceId } = req.body;

    const notification = await Notification.findOne({
      _id: notificationId,
      deviceId
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
    const { deviceId } = req.body;

    await Notification.updateMany(
      { deviceId, isRead: false },
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
    const { deviceId } = req.body;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      deviceId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

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
    const deviceId = req.query.deviceId;

    // Build query
    const query = {};
    if (deviceId) query.deviceId = deviceId;

    // Get total notifications
    const totalNotifications = await Notification.countDocuments(query);

    // Get notifications by app
    const appStats = await Notification.aggregate([
      { $match: query },
      { $group: { _id: '$appName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = await Notification.countDocuments({
      ...query,
      timestamp: { $gte: sevenDaysAgo }
    });

    // Get today's notifications
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayNotifications = await Notification.countDocuments({
      ...query,
      timestamp: { $gte: today }
    });

    res.json({
      success: true,
      data: {
        totalNotifications,
        appStats,
        recentActivity,
        todayNotifications
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

module.exports = {
  storeNotification,
  getAllNotifications,
  getDeviceNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats
}; 