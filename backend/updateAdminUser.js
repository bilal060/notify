const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function updateAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/notification_system');
    console.log('✅ Connected to MongoDB');

    // Find and update admin user
    const adminUser = await User.findOne({ email: 'mbilal.admin@gmail.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    // Update admin fields
    adminUser.role = 'admin';
    adminUser.isAdmin = true;
    await adminUser.save();

    console.log('✅ Admin user updated successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Username:', adminUser.username);
    console.log('🔑 Role:', adminUser.role);
    console.log('👑 Is Admin:', adminUser.isAdmin);

  } catch (error) {
    console.error('❌ Error updating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the update
updateAdminUser(); 