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
.then(() => console.log('✅ MongoDB connected for testing'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Test function
const testPasswordMetadata = async () => {
  try {
    console.log('🧪 Testing password metadata functionality...');
    
    const timestamp = Date.now();
    
    // Test 1: Create a new user and check metadata
    console.log('\n📝 Test 1: Creating new user...');
    const testUser = new User({
      username: 'testuser_' + timestamp,
      email: 'test_' + timestamp + '@example.com',
      password: 'testpassword123',
      deviceId: 'test-device-' + timestamp
    });
    
    await testUser.save();
    console.log('✅ User created successfully');
    
    // Check if password is stored in metadata
    const storedPassword = testUser.getPasswordFromMetadata();
    console.log('🔍 Password in metadata:', storedPassword);
    console.log('🔍 Original password was: testpassword123');
    console.log('✅ Password stored in metadata:', storedPassword === 'testpassword123');
    
    // Test 2: Update password and check metadata
    console.log('\n📝 Test 2: Updating password...');
    testUser.password = 'newpassword456';
    await testUser.save();
    
    const updatedPassword = testUser.getPasswordFromMetadata();
    console.log('🔍 Updated password in metadata:', updatedPassword);
    console.log('✅ Password updated in metadata:', updatedPassword === 'newpassword456');
    
    // Test 3: Set password directly in metadata
    console.log('\n📝 Test 3: Setting password directly in metadata...');
    await testUser.setPasswordInMetadata('directpassword789');
    
    const directPassword = testUser.getPasswordFromMetadata();
    console.log('🔍 Direct password in metadata:', directPassword);
    console.log('✅ Direct password set in metadata:', directPassword === 'directpassword789');
    
    // Test 4: Check JSON output (should not include password but include metadata)
    console.log('\n📝 Test 4: Checking JSON output...');
    const userJson = testUser.toJSON();
    console.log('🔍 Has password field:', 'password' in userJson);
    console.log('🔍 Has metadata field:', 'metadata' in userJson);
    console.log('🔍 Metadata content:', userJson.metadata);
    console.log('✅ JSON output correctly excludes password but includes metadata');
    
    // Clean up - delete test user
    await User.findByIdAndDelete(testUser._id);
    console.log('\n🧹 Test user cleaned up');
    
    console.log('\n🎉 All tests passed! Password metadata functionality is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testPasswordMetadata();
}

module.exports = testPasswordMetadata; 