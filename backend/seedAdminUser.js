const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const adminUser = {
  email: 'mbilal.admin@gmail.com',
  password: 'mbilal.admin',
  username: 'mbilal_admin',
  deviceId: 'admin-web-device',
  role: 'admin',
  isAdmin: true
};

async function seedAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/notification_system');
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Username:', existingAdmin.username);
      console.log('🔑 Role:', existingAdmin.role || 'user');
      return;
    }

    // Create new admin user
    const newAdmin = new User(adminUser);
    await newAdmin.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', newAdmin.email);
    console.log('👤 Username:', newAdmin.username);
    console.log('🔑 Role: admin');
    console.log('🆔 User ID:', newAdmin._id);

    console.log('\n🎯 Admin Login Credentials:');
    console.log('   Email: mbilal.admin@gmail.com');
    console.log('   Password: mbilal.admin');
    console.log('\n🌐 Access the admin dashboard at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding
seedAdminUser(); 