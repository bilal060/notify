const mobileFirebaseService = require('./services/mobileFirebaseService');

async function testOptimizedDataStorage() {
  console.log('🧪 Testing Optimized Data Storage...\n');

  try {
    const deviceId = 'test-device-optimized';
    
    // Test 1: Store WhatsApp data (first time)
    console.log('1️⃣ Storing WhatsApp data (first time)...');
    const whatsappData1 = {
      deviceInfo: { deviceId, timestamp: Date.now() },
      messages: [
        { id: 'msg1', from: 'user1', to: 'user2', body: 'Hello', timestamp: Date.now() },
        { id: 'msg2', from: 'user2', to: 'user1', body: 'Hi there', timestamp: Date.now() }
      ],
      contacts: [
        { id: 'contact1', name: 'John Doe', phoneNumber: '+1234567890', status: 'online' },
        { id: 'contact2', name: 'Jane Smith', phoneNumber: '+0987654321', status: 'offline' }
      ],
      businessData: [
        { id: 'business1', name: 'Test Business', description: 'A test business', category: 'retail' }
      ]
    };

    const result1 = await mobileFirebaseService.storeWhatsAppData(whatsappData1);
    console.log(`✅ First WhatsApp storage result: ${result1.firebaseId}\n`);

    // Test 2: Store WhatsApp data (second time - should update existing)
    console.log('2️⃣ Storing WhatsApp data (second time - should update existing)...');
    const whatsappData2 = {
      deviceInfo: { deviceId, timestamp: Date.now() },
      messages: [
        { id: 'msg3', from: 'user1', to: 'user3', body: 'New message', timestamp: Date.now() },
        { id: 'msg4', from: 'user3', to: 'user1', body: 'Reply', timestamp: Date.now() }
      ],
      contacts: [
        { id: 'contact3', name: 'Bob Wilson', phoneNumber: '+1122334455', status: 'online' }
      ],
      businessData: [
        { id: 'business2', name: 'Another Business', description: 'Another test business', category: 'services' }
      ]
    };

    const result2 = await mobileFirebaseService.storeWhatsAppData(whatsappData2);
    console.log(`✅ Second WhatsApp storage result: ${result2.firebaseId}\n`);

    // Test 3: Store contacts (first time)
    console.log('3️⃣ Storing contacts (first time)...');
    const contactsData1 = {
      deviceId,
      contacts: [
        { id: 'contact1', name: 'John Doe', hasPhone: true, phoneNumbers: ['+1234567890'], email: 'john@example.com' },
        { id: 'contact2', name: 'Jane Smith', hasPhone: true, phoneNumbers: ['+0987654321'], email: 'jane@example.com' }
      ],
      timestamp: Date.now()
    };

    const contactsResult1 = await mobileFirebaseService.storeContacts(contactsData1);
    console.log(`✅ First contacts storage result: ${contactsResult1.count} contacts\n`);

    // Test 4: Store contacts (second time - should skip duplicates)
    console.log('4️⃣ Storing contacts (second time - should skip duplicates)...');
    const contactsData2 = {
      deviceId,
      contacts: [
        { id: 'contact1', name: 'John Doe Updated', hasPhone: true, phoneNumbers: ['+1234567890'], email: 'john@example.com' }, // Duplicate
        { id: 'contact3', name: 'Bob Wilson', hasPhone: true, phoneNumbers: ['+1122334455'], email: 'bob@example.com' } // New
      ],
      timestamp: Date.now()
    };

    const contactsResult2 = await mobileFirebaseService.storeContacts(contactsData2);
    console.log(`✅ Second contacts storage result: ${contactsResult2.count} new contacts\n`);

    // Test 5: Store SMS messages (first time)
    console.log('5️⃣ Storing SMS messages (first time)...');
    const smsData1 = {
      deviceId,
      messages: [
        { id: 'sms1', address: '+1234567890', body: 'Hello via SMS', date: Date.now(), type: 'inbox' },
        { id: 'sms2', address: '+0987654321', body: 'Reply via SMS', date: Date.now(), type: 'sent' }
      ],
      timestamp: Date.now()
    };

    const smsResult1 = await mobileFirebaseService.storeSMS(smsData1);
    console.log(`✅ First SMS storage result: ${smsResult1.count} messages\n`);

    // Test 6: Store SMS messages (second time - should skip duplicates)
    console.log('6️⃣ Storing SMS messages (second time - should skip duplicates)...');
    const smsData2 = {
      deviceId,
      messages: [
        { id: 'sms1', address: '+1234567890', body: 'Hello via SMS updated', date: Date.now(), type: 'inbox' }, // Duplicate
        { id: 'sms3', address: '+1122334455', body: 'New SMS message', date: Date.now(), type: 'inbox' } // New
      ],
      timestamp: Date.now()
    };

    const smsResult2 = await mobileFirebaseService.storeSMS(smsData2);
    console.log(`✅ Second SMS storage result: ${smsResult2.count} new messages\n`);

    console.log('✅ All optimized data storage tests completed successfully!');
    console.log('\n📋 Expected Results:');
    console.log('   - 1 WhatsApp document per device (not multiple)');
    console.log('   - Cumulative stats: Messages: 4, Contacts: 3, Business: 2');
    console.log('   - No duplicate contacts or SMS messages');
    console.log('   - Efficient subcollection structure');

  } catch (error) {
    console.error('❌ Error testing optimized data storage:', error);
  }
}

// Run the test
testOptimizedDataStorage().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 