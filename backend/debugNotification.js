const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');
require('dotenv').config();

async function debugNotification() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'mob_notifications'
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Find all notifications
    const notifications = await Notification.find({});
    console.log(`Found ${notifications.length} total notifications`);
    
    for (const notification of notifications) {
      console.log('\n--- Notification ---');
      console.log('ID:', notification._id);
      console.log('Title:', notification.title);
      console.log('Has user field:', 'user' in notification);
      console.log('Has userId field:', 'userId' in notification);
      if ('user' in notification) {
        console.log('User field type:', typeof notification.user);
        console.log('User field value:', notification.user);
      }
      if ('userId' in notification) {
        console.log('UserId field value:', notification.userId);
      }
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run debug
debugNotification(); 