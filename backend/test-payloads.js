const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

// Test notification payload
const testNotificationPayload = {
  deviceId: "test-device-123",
  title: "Test Notification",
  body: "This is a test notification body",
  appName: "Test App",
  packageName: "com.test.app",
  deviceInfo: {
    platform: "Android",
    version: "13",
    userAgent: "test",
    language: "en",
    screenResolution: "1080x1920",
    timezone: "UTC"
  },
  notificationData: {
    priority: "high",
    category: "test",
    test: "data"
  }
};

// Test batch notifications payload
const testBatchNotificationsPayload = {
  deviceId: "test-device-123",
  notifications: [
    {
      title: "Batch Notification 1",
      body: "First batch notification",
      appName: "Test App",
      packageName: "com.test.app",
      deviceInfo: {
        platform: "Android",
        version: "13"
      },
      notificationData: {
        priority: "normal",
        category: "batch"
      }
    },
    {
      title: "Batch Notification 2",
      body: "Second batch notification",
      appName: "Test App",
      packageName: "com.test.app",
      deviceInfo: {
        platform: "Android",
        version: "13"
      },
      notificationData: {
        priority: "high",
        category: "batch"
      }
    }
  ],
  batchSize: 2,
  timestamp: new Date().toISOString()
};

// Test Gmail email payload
const testGmailPayload = {
  emails: [
    {
      messageId: "test-message-123",
      threadId: "test-thread-123",
      subject: "Test Email",
      from: "sender@example.com",
      to: "recipient@example.com",
      cc: "",
      bcc: "",
      body: "This is a test email body",
      bodyHtml: "<p>This is a test email body</p>",
      isRead: false,
      isStarred: false,
      isImportant: false,
      labels: ["INBOX"],
      internalDate: "2025-07-14T17:35:00.000Z",
      sizeEstimate: 1024,
      snippet: "This is a test email snippet",
      attachments: []
    }
  ],
  deviceId: "test-device-123"
};

async function testNotificationEndpoints() {
  console.log('🧪 Testing Notification Endpoints...\n');

  try {
    // Test single notification
    console.log('1. Testing single notification storage...');
    const singleResponse = await axios.post(`${BASE_URL}/api/notifications/store`, testNotificationPayload);
    console.log('✅ Single notification stored:', singleResponse.data);

    // Test batch notifications
    console.log('\n2. Testing batch notifications storage...');
    const batchResponse = await axios.post(`${BASE_URL}/api/notifications/store/batch`, testBatchNotificationsPayload);
    console.log('✅ Batch notifications stored:', batchResponse.data);

    // Test retrieving notifications
    console.log('\n3. Testing notification retrieval...');
    const getResponse = await axios.get(`${BASE_URL}/api/notifications?deviceId=test-device-123`);
    console.log('✅ Notifications retrieved:', getResponse.data.data.notifications.length, 'notifications');

    // Test notification stats
    console.log('\n4. Testing notification stats...');
    const statsResponse = await axios.get(`${BASE_URL}/api/notifications/stats?deviceId=test-device-123`);
    console.log('✅ Notification stats:', statsResponse.data);

  } catch (error) {
    console.error('❌ Notification test failed:', error.response?.data || error.message);
  }
}

async function testGmailEndpoints() {
  console.log('\n📧 Testing Gmail Endpoints...\n');

  try {
    // Test Gmail auth URL
    console.log('1. Testing Gmail auth URL...');
    const authUrlResponse = await axios.get(`${BASE_URL}/api/gmail/auth/url`);
    console.log('✅ Gmail auth URL generated:', authUrlResponse.data.authUrl ? 'Yes' : 'No');

    // Test Gmail email storage (will fail without Gmail account)
    console.log('\n2. Testing Gmail email storage...');
    try {
      const emailResponse = await axios.post(`${BASE_URL}/api/gmail/store/test-user`, testGmailPayload);
      console.log('✅ Gmail emails stored:', emailResponse.data);
    } catch (error) {
      console.log('⚠️ Gmail email storage failed (expected without Gmail account):', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Gmail test failed:', error.response?.data || error.message);
  }
}

async function testDeviceEndpoints() {
  console.log('\n📱 Testing Device Endpoints...\n');

  try {
    // Test device info
    console.log('1. Testing device info storage...');
    const deviceInfoPayload = {
      deviceId: "test-device-123",
      manufacturer: "Samsung",
      model: "Galaxy S23",
      androidVersion: "13",
      sdkVersion: "33",
      timestamp: new Date().toISOString()
    };
    const deviceResponse = await axios.post(`${BASE_URL}/api/device/info`, deviceInfoPayload);
    console.log('✅ Device info stored:', deviceResponse.data);

    // Test apps list
    console.log('\n2. Testing apps list storage...');
    const appsPayload = {
      deviceId: "test-device-123",
      apps: [
        { packageName: "com.whatsapp", appName: "WhatsApp" },
        { packageName: "com.facebook.katana", appName: "Facebook" },
        { packageName: "com.instagram.android", appName: "Instagram" }
      ]
    };
    const appsResponse = await axios.post(`${BASE_URL}/api/apps/list`, appsPayload);
    console.log('✅ Apps list stored:', appsResponse.data);

    // Test device retrieval
    console.log('\n3. Testing device data retrieval...');
    const getDevicesResponse = await axios.get(`${BASE_URL}/api/devices`);
    console.log('✅ Devices retrieved:', getDevicesResponse.data.data.length, 'devices');

  } catch (error) {
    console.error('❌ Device test failed:', error.response?.data || error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Payload Tests...\n');
  
  await testNotificationEndpoints();
  await testGmailEndpoints();
  await testDeviceEndpoints();
  
  console.log('\n✅ All tests completed!');
}

// Run the tests
runAllTests().catch(console.error); 