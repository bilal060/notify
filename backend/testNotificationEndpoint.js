const notificationController = require('./controllers/notificationController');

// Mock request and response objects
const mockReq = {
  body: {
    deviceId: 'test-device-6',
    title: 'Mock Test Notification',
    body: 'This is a test notification',
    appName: 'Test App',
    packageName: 'com.test.app'
  }
};

const mockRes = {
  status: function(code) {
    console.log(`Response status: ${code}`);
    return this;
  },
  json: function(data) {
    console.log('Response data:', JSON.stringify(data, null, 2));
    return this;
  }
};

async function testNotificationEndpoint() {
  console.log('🧪 Testing Notification Endpoint...\n');
  
  try {
    console.log('Calling storeNotification...');
    await notificationController.storeNotification(mockReq, mockRes);
    console.log('✅ Notification endpoint test completed');
  } catch (error) {
    console.error('❌ Notification endpoint test failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run the test
testNotificationEndpoint(); 