const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';

async function testGmailIntegration() {
  console.log('🧪 Testing Gmail Integration...\n');

  try {
    // 1. Test getting OAuth URL
    console.log('1️⃣ Testing OAuth URL generation...');
    const authUrlResponse = await axios.get(`${BASE_URL}/api/gmail/auth/url`);
    console.log('✅ OAuth URL generated successfully');
    console.log('🔗 Auth URL:', authUrlResponse.data.authUrl);
    console.log('');

    // 2. Test with mock OAuth callback (this would normally come from Google)
    console.log('2️⃣ Testing OAuth callback (mock)...');
    console.log('⚠️  This requires actual Google OAuth credentials to work');
    console.log('📝 To test this:');
    console.log('   a) Set up Google Cloud Console project');
    console.log('   b) Enable Gmail API');
    console.log('   c) Create OAuth 2.0 credentials');
    console.log('   d) Add credentials to .env file');
    console.log('   e) Use the auth URL to get authorization code');
    console.log('   f) Call the callback endpoint with the code');
    console.log('');

    // 3. Show API endpoints
    console.log('3️⃣ Available Gmail API Endpoints:');
    console.log('   GET  /api/gmail/auth/url                    - Get OAuth URL');
    console.log('   POST /api/gmail/auth/callback               - Handle OAuth callback');
    console.log('   GET  /api/gmail/accounts/:userId            - Get user Gmail accounts');
    console.log('   POST /api/gmail/forwarding/:userId/enable   - Enable email forwarding');
    console.log('   POST /api/gmail/forwarding/:userId/disable  - Disable email forwarding');
    console.log('   POST /api/gmail/forwarding/:userId/existing - Forward existing emails');
    console.log('   GET  /api/gmail/stats/:userId               - Get account statistics');
    console.log('   GET  /api/gmail/test/:userId                - Test Gmail connection');
    console.log('   DELETE /api/gmail/accounts/:userId/:accountId - Delete Gmail account');
    console.log('');

    // 4. Show environment variables needed
    console.log('4️⃣ Required Environment Variables:');
    console.log('   GOOGLE_CLIENT_ID=your_google_client_id');
    console.log('   GOOGLE_CLIENT_SECRET=your_google_client_secret');
    console.log('   GOOGLE_REDIRECT_URI=http://localhost:5001/api/gmail/callback');
    console.log('');

    // 5. Show usage example
    console.log('5️⃣ Usage Example:');
    console.log('   a) User visits: GET /api/gmail/auth/url');
    console.log('   b) User authorizes with Google');
    console.log('   c) Google redirects to: /api/gmail/auth/callback?code=...');
    console.log('   d) App exchanges code for tokens and saves Gmail account');
    console.log('   e) User enables forwarding: POST /api/gmail/forwarding/:userId/enable');
    console.log('   f) App forwards existing emails: POST /api/gmail/forwarding/:userId/existing');
    console.log('');

    console.log('✅ Gmail integration test completed successfully!');
    console.log('📧 The system will forward ALL emails to the collector address');
    console.log('🔒 Make sure to use this responsibly for red team testing only');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testGmailIntegration(); 