const axios = require('axios');

// Test Firebase integration
const BASE_URL = 'http://localhost:5001/api';
const TEST_TOKEN = 'your_test_token'; // Replace with actual token

// Sample data for testing
const sampleNotifications = [
  {
    title: 'Test Notification 1',
    text: 'This is a test notification from Firebase integration',
    packageName: 'com.test.app',
    timestamp: new Date().toISOString(),
    type: 'test'
  },
  {
    title: 'Test Notification 2',
    text: 'Another test notification for Firebase sync',
    packageName: 'com.test.app2',
    timestamp: new Date().toISOString(),
    type: 'test'
  }
];

const sampleMessages = [
  {
    address: '+1234567890',
    body: 'Test message from Firebase integration',
    type: 'inbox',
    timestamp: new Date().toISOString()
  },
  {
    address: '+0987654321',
    body: 'Another test message for sync',
    type: 'sent',
    timestamp: new Date().toISOString()
  }
];

const sampleContacts = [
  {
    name: 'Test Contact 1',
    phone: '+1234567890',
    email: 'test1@example.com'
  },
  {
    name: 'Test Contact 2',
    phone: '+0987654321',
    email: 'test2@example.com'
  }
];

const sampleCallLogs = [
  {
    number: '+1234567890',
    type: 'incoming',
    duration: 120,
    timestamp: new Date().toISOString()
  },
  {
    number: '+0987654321',
    type: 'outgoing',
    duration: 60,
    timestamp: new Date().toISOString()
  }
];

const sampleEmails = [
  {
    subject: 'Test Email 1',
    from: 'test1@example.com',
    to: 'user@example.com',
    body: 'This is a test email for Firebase sync',
    timestamp: new Date().toISOString()
  },
  {
    subject: 'Test Email 2',
    from: 'test2@example.com',
    to: 'user@example.com',
    body: 'Another test email for sync',
    timestamp: new Date().toISOString()
  }
];

// Test functions
async function testFirebaseSync() {
  console.log('🔥 Testing Firebase Integration...\n');

  const deviceId = `test-device-${Date.now()}`;
  const headers = { Authorization: `Bearer ${TEST_TOKEN}` };

  try {
    // Test 1: Sync notifications
    console.log('📱 Testing notification sync...');
    const notificationResponse = await axios.post(`${BASE_URL}/firebase/sync/notifications`, {
      notifications: sampleNotifications,
      deviceId
    }, { headers });
    console.log('✅ Notifications synced:', notificationResponse.data);

    // Test 2: Sync messages
    console.log('\n💬 Testing message sync...');
    const messageResponse = await axios.post(`${BASE_URL}/firebase/sync/messages`, {
      messages: sampleMessages,
      deviceId
    }, { headers });
    console.log('✅ Messages synced:', messageResponse.data);

    // Test 3: Sync contacts
    console.log('\n👥 Testing contact sync...');
    const contactResponse = await axios.post(`${BASE_URL}/firebase/sync/contacts`, {
      contacts: sampleContacts,
      deviceId
    }, { headers });
    console.log('✅ Contacts synced:', contactResponse.data);

    // Test 4: Sync call logs
    console.log('\n📞 Testing call log sync...');
    const callLogResponse = await axios.post(`${BASE_URL}/firebase/sync/call-logs`, {
      callLogs: sampleCallLogs,
      deviceId
    }, { headers });
    console.log('✅ Call logs synced:', callLogResponse.data);

    // Test 5: Sync emails
    console.log('\n📧 Testing email sync...');
    const emailResponse = await axios.post(`${BASE_URL}/firebase/sync/emails`, {
      emails: sampleEmails,
      deviceId
    }, { headers });
    console.log('✅ Emails synced:', emailResponse.data);

    // Test 6: Update device status
    console.log('\n📊 Testing device status update...');
    const statusResponse = await axios.post(`${BASE_URL}/firebase/device/status`, {
      deviceId,
      status: {
        battery: 85,
        network: 'WiFi',
        location: 'Test Location',
        isOnline: true
      }
    }, { headers });
    console.log('✅ Device status updated:', statusResponse.data);

    // Test 7: Get sync status
    console.log('\n📈 Testing sync status retrieval...');
    const syncStatusResponse = await axios.get(`${BASE_URL}/firebase/sync-status/${deviceId}`, { headers });
    console.log('✅ Sync status retrieved:', syncStatusResponse.data);

    // Test 8: Get real-time updates
    console.log('\n⚡ Testing real-time updates...');
    const realtimeResponse = await axios.get(`${BASE_URL}/firebase/realtime/${deviceId}`, { headers });
    console.log('✅ Real-time updates retrieved:', realtimeResponse.data);

    // Test 9: Bulk sync
    console.log('\n🚀 Testing bulk sync...');
    const bulkResponse = await axios.post(`${BASE_URL}/firebase/sync/bulk`, {
      deviceId,
      data: {
        notifications: sampleNotifications,
        messages: sampleMessages,
        contacts: sampleContacts,
        callLogs: sampleCallLogs,
        emails: sampleEmails
      }
    }, { headers });
    console.log('✅ Bulk sync completed:', bulkResponse.data);

    // Test 10: Get data from Firebase
    console.log('\n📋 Testing data retrieval...');
    const dataResponse = await axios.get(`${BASE_URL}/firebase/data/notifications/${deviceId}?limit=10`, { headers });
    console.log('✅ Data retrieved:', dataResponse.data);

    console.log('\n🎉 All Firebase integration tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test push notification
async function testPushNotification() {
  console.log('\n🔔 Testing push notification...');
  
  try {
    const response = await axios.post(`${BASE_URL}/firebase/push-notification`, {
      deviceToken: 'your_device_token_here',
      notification: {
        title: 'Secret Notification',
        body: 'This is a secret notification from Firebase',
        data: {
          type: 'secret',
          priority: 'high'
        }
      }
    }, { headers: { Authorization: `Bearer ${TEST_TOKEN}` } });
    
    console.log('✅ Push notification sent:', response.data);
  } catch (error) {
    console.error('❌ Push notification test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Firebase Integration Tests...\n');
  
  await testFirebaseSync();
  await testPushNotification();
  
  console.log('\n✨ Firebase integration testing completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Configure Firebase service account credentials in .env file');
  console.log('2. Set up Firebase project with Firestore and Realtime Database');
  console.log('3. Configure Firebase Storage for media files');
  console.log('4. Set up Firebase Cloud Messaging for push notifications');
  console.log('5. Test with real device data');
}

// Export for use in other files
module.exports = {
  testFirebaseSync,
  testPushNotification,
  runTests
};

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
} 