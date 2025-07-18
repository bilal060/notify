const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// Test data
const testData = {
  // WhatsApp data
  whatsapp: {
    deviceInfo: {
      deviceId: 'test_device_123',
      timestamp: Date.now(),
      harvestType: 'whatsapp'
    },
    messages: [
      {
        id: 'msg_1',
        from: 'John Doe',
        body: 'Hello, how are you?',
        timestamp: Date.now(),
        type: 'text'
      },
      {
        id: 'msg_2',
        from: 'Jane Smith',
        body: 'Meeting at 3 PM',
        timestamp: Date.now(),
        type: 'text'
      }
    ],
    contacts: [
      {
        id: 1,
        name: 'John Doe',
        phoneNumber: '+1234567890'
      },
      {
        id: 2,
        name: 'Jane Smith',
        phoneNumber: '+0987654321'
      }
    ],
    businessData: []
  },

  // Contacts data
  contacts: {
    deviceId: 'test_device_123',
    timestamp: Date.now(),
    contacts: [
      {
        id: 1,
        name: 'John Doe',
        phoneNumber: '+1234567890',
        hasPhone: true,
        phoneNumbers: [],
        email: 'john@example.com',
        organization: 'Company Inc'
      },
      {
        id: 2,
        name: 'Jane Smith',
        phoneNumber: '+0987654321',
        hasPhone: true,
        phoneNumbers: [],
        email: 'jane@example.com',
        organization: 'Corp Ltd'
      }
    ]
  },

  // SMS data
  sms: {
    deviceId: 'test_device_123',
    timestamp: Date.now(),
    messages: [
      {
        address: '+1234567890',
        body: 'Hello from SMS',
        date: Date.now(),
        type: 'inbox',
        threadId: 'thread_1'
      },
      {
        address: '+0987654321',
        body: 'Meeting reminder',
        date: Date.now(),
        type: 'sent',
        threadId: 'thread_2'
      }
    ]
  },

  // Notifications data
  notifications: {
    notifications: [
      {
        title: 'Test Notification 1',
        body: 'This is a test notification',
        appName: 'Test App',
        packageName: 'com.test.app',
        deviceInfo: {},
        notificationData: {}
      },
      {
        title: 'Test Notification 2',
        body: 'Another test notification',
        appName: 'Another App',
        packageName: 'com.another.app',
        deviceInfo: {},
        notificationData: {}
      }
    ],
    deviceId: 'test_device_123',
    batchSize: 2
  },

  // Gmail data
  gmail: {
    deviceId: 'test_device_123',
    emails: [
      {
        messageId: 'email_1',
        threadId: 'thread_1',
        subject: 'Test Email 1',
        from: 'sender@example.com',
        to: 'recipient@example.com',
        body: 'This is a test email',
        internalDate: new Date().toISOString(),
        isRead: false,
        isStarred: false,
        isImportant: false,
        labels: [],
        sizeEstimate: 1000,
        snippet: 'Test email snippet',
        attachments: []
      },
      {
        messageId: 'email_2',
        threadId: 'thread_2',
        subject: 'Test Email 2',
        from: 'another@example.com',
        to: 'recipient@example.com',
        body: 'Another test email',
        internalDate: new Date().toISOString(),
        isRead: true,
        isStarred: false,
        isImportant: false,
        labels: [],
        sizeEstimate: 1500,
        snippet: 'Another test email snippet',
        attachments: []
      }
    ]
  }
};

async function testEndpoint(endpoint, data, description) {
  try {
    console.log(`\n🧪 Testing ${description}...`);
    console.log(`📡 Endpoint: ${endpoint}`);
    
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log(`✅ Success! Status: ${response.status}`);
    console.log(`📊 Response:`, response.data);
    
    return true;
  } catch (error) {
    console.log(`❌ Failed! Status: ${error.response?.status || 'No response'}`);
    console.log(`🚨 Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting endpoint tests...\n');
  
  const results = {
    whatsapp: await testEndpoint('/whatsapp/store', testData.whatsapp, 'WhatsApp Data'),
    contacts: await testEndpoint('/contacts/store', testData.contacts, 'Contacts Data'),
    sms: await testEndpoint('/sms/store', testData.sms, 'SMS Data'),
    notifications: await testEndpoint('/notifications/store/batch', testData.notifications, 'Notifications Data'),
    gmail: await testEndpoint('/gmail/store/test_user', testData.gmail, 'Gmail Data')
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([endpoint, success]) => {
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${endpoint}`);
  });
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passed}/${total} endpoints working`);
  
  if (passed === total) {
    console.log('🎉 All endpoints are working correctly!');
  } else {
    console.log('⚠️  Some endpoints need attention.');
  }
}

// Run the tests
runTests().catch(console.error); 