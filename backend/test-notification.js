const axios = require('axios');

const BASE_URL = 'https://notification-backend-8j8p.onrender.com/api';

async function testNotificationSystem() {
  console.log('🧪 Testing Notification System...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    console.log('');

    // Test 2: Notification test endpoint
    console.log('2️⃣ Testing notification test endpoint...');
    const testResponse = await axios.get(`${BASE_URL}/notifications/test`);
    console.log('✅ Notification test passed:', testResponse.data.message);
    console.log('');

    // Test 3: Store a test notification
    console.log('3️⃣ Testing notification storage...');
    const testNotification = {
      deviceId: 'test-device-' + Date.now(),
      title: 'Test Notification',
      body: 'This is a test notification from the backend test script',
      appName: 'Test App',
      packageName: 'com.test.app',
      deviceInfo: {
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
        androidVersion: '13',
        sdkVersion: 33
      },
      notificationData: {
        test: true,
        timestamp: Date.now()
      }
    };

    const storeResponse = await axios.post(`${BASE_URL}/notifications/store`, testNotification);
    console.log('✅ Notification stored successfully:', storeResponse.data.message);
    console.log('📱 Notification ID:', storeResponse.data.data.notificationId);
    console.log('');

    // Test 4: Get all notifications
    console.log('4️⃣ Testing get all notifications...');
    const getAllResponse = await axios.get(`${BASE_URL}/notifications`);
    console.log('✅ Retrieved notifications:', getAllResponse.data.data.notifications.length, 'total');
    console.log('');

    // Test 5: Get device notifications
    console.log('5️⃣ Testing get device notifications...');
    const deviceResponse = await axios.get(`${BASE_URL}/notifications/device/${testNotification.deviceId}`);
    console.log('✅ Retrieved device notifications:', deviceResponse.data.data.notifications.length, 'for device');
    console.log('');

    console.log('🎉 All tests passed! Notification system is working correctly.');
    console.log('📊 Backend URL:', BASE_URL);
    console.log('📱 Test device ID:', testNotification.deviceId);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('🔗 URL:', error.config?.url);
    console.error('📝 Status:', error.response?.status);
  }
}

// Run the test
testNotificationSystem(); 