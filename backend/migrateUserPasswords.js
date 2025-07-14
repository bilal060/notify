const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'mob_notifications'
})
.then(() => console.log('✅ MongoDB connected for migration'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Migration function
const migrateUserPasswords = async () => {
  try {
    console.log('🔄 Starting password migration...');
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const user of users) {
      try {
        // Check if password is already in metadata
        const existingPass = user.metadata.get('pass');
        
        if (existingPass) {
          console.log(`⏭️  User ${user.username} already has password in metadata, skipping...`);
          skippedCount++;
          continue;
        }
        
        // For existing users, we can't recover the original password
        // So we'll set a placeholder and note that it needs manual update
        user.metadata.set('pass', '[MIGRATION_REQUIRED]');
        await user.save();
        
        console.log(`✅ Migrated user: ${user.username}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrating user ${user.username}:`, error.message);
      }
    }
    
    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} users`);
    console.log(`⏭️  Skipped (already migrated): ${skippedCount} users`);
    console.log(`📊 Total processed: ${users.length} users`);
    
    if (migratedCount > 0) {
      console.log('\n⚠️  IMPORTANT: Users marked with [MIGRATION_REQUIRED] need manual password update');
      console.log('   You may want to implement a password reset flow for these users');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateUserPasswords();
}

module.exports = migrateUserPasswords; 