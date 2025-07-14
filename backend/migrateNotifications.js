const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');
require('dotenv').config();

async function migrateNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'mob_notifications'
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Find all notifications with the old 'user' field (ObjectId)
    const notifications = await Notification.find({ user: { $exists: true } });
    console.log(`Found ${notifications.length} notifications to migrate`);
    
    let migratedCount = 0;
    
    for (const notification of notifications) {
      try {
        // The user field might be a string ObjectId or an ObjectId reference
        let userId;
        if (typeof notification.user === 'string') {
          // If it's a string, treat it as ObjectId
          const user = await User.findById(notification.user);
          if (user && user.uniqueId) {
            userId = user.uniqueId;
          }
        } else if (notification.user && notification.user.toString) {
          // If it's an ObjectId
          const user = await User.findById(notification.user.toString());
          if (user && user.uniqueId) {
            userId = user.uniqueId;
          }
        }
        
        if (userId) {
          // Update the notification to use userId instead of user
          await Notification.findByIdAndUpdate(notification._id, {
            $set: { userId: userId },
            $unset: { user: 1 }
          });
          migratedCount++;
          console.log(`Migrated notification ${notification._id} for user ${userId}`);
        } else {
          console.log(`Skipping notification ${notification._id} - user not found`);
        }
      } catch (error) {
        console.error(`Error migrating notification ${notification._id}:`, error.message);
      }
    }
    
    console.log(`✅ Migration completed. ${migratedCount} notifications migrated.`);
    
    // Verify migration
    const remainingOldNotifications = await Notification.find({ user: { $exists: true } });
    console.log(`Remaining notifications with old 'user' field: ${remainingOldNotifications.length}`);
    
    const newNotifications = await Notification.find({ userId: { $exists: true } });
    console.log(`Notifications with new 'userId' field: ${newNotifications.length}`);
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migrateNotifications(); 