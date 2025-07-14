const mongoose = require('mongoose');
require('dotenv').config();

// Check existing users and schema
const checkUserSchema = async () => {
  try {
    console.log('🔍 Checking existing user schema and data...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'mob_notifications'
    });
    console.log('✅ MongoDB connected');
    
    // Get the User collection
    const db = mongoose.connection.db;
    const userCollection = db.collection('users');
    
    // Get collection info
    const collectionInfo = await userCollection.stats();
    console.log('📊 Collection stats:', collectionInfo);
    
    // Get indexes
    const indexes = await userCollection.indexes();
    console.log('🔗 Indexes:', JSON.stringify(indexes, null, 2));
    
    // Get a sample user
    const sampleUser = await userCollection.findOne({});
    if (sampleUser) {
      console.log('👤 Sample user structure:', JSON.stringify(sampleUser, null, 2));
    } else {
      console.log('📭 No users found in collection');
    }
    
    // Count total users
    const userCount = await userCollection.countDocuments();
    console.log('📈 Total users in collection:', userCount);
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  checkUserSchema();
}

module.exports = checkUserSchema; 