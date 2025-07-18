const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

async function testAdminLogin() {
  console.log('🧪 Testing Admin Login...\n');

  try {
    const adminCredentials = {
      email: 'mbilal.admin@gmail.com',
      password: 'mbilal.admin',
      deviceId: 'admin-test-device'
    };

    console.log('1️⃣ Testing admin login...');
    console.log('📧 Email:', adminCredentials.email);
    console.log('🔑 Password:', adminCredentials.password);
    console.log('');

    const response = await axios.post(`${BASE_URL}/api/auth/signin`, adminCredentials);
    
    if (response.data.success) {
      console.log('✅ Admin login successful!');
      console.log('🔑 Token received');
      console.log('👤 User data:', {
        email: response.data.data.user.email,
        username: response.data.data.user.username,
        role: response.data.data.user.role,
        isAdmin: response.data.data.user.isAdmin
      });
      console.log('');
      
      console.log('2️⃣ Email fetching should be running in background...');
      console.log('📧 Check server logs for email fetching progress');
      console.log('');
      
      console.log('3️⃣ Admin Dashboard Access:');
      console.log('   🌐 Frontend: http://localhost:3000');
      console.log('   🔐 Login with: mbilal.admin@gmail.com / mbilal.admin');
      console.log('');
      
      console.log('4️⃣ Available Admin Features:');
      console.log('   📱 Devices Management');
      console.log('   👥 Users Management');
      console.log('   🔔 Notifications View');
      console.log('   📧 Emails Management');
      console.log('   💬 SMS Management');
      console.log('   📞 Call Logs');
      console.log('   👤 Contacts');
      console.log('   📨 Gmail Accounts');
      console.log('');
      
      console.log('✅ Admin login test completed successfully!');
      
    } else {
      console.log('❌ Admin login failed:', response.data.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   - Make sure the backend server is running');
    console.log('   - Check if admin user exists in database');
    console.log('   - Verify admin credentials are correct');
    console.log('   - Run: node seedAdminUser.js to create admin user');
  }
}

// Run the test
testAdminLogin(); 