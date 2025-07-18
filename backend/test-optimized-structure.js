const { db } = require('./config/firebase');

async function testOptimizedStructure() {
  console.log('🧪 Testing Optimized Firebase Structure...\n');

  try {
    // Test 1: Check WhatsApp documents
    console.log('1️⃣ Checking WhatsApp documents...');
    const whatsappQuery = await db.collection('whatsapp').get();
    console.log(`📊 Found ${whatsappQuery.size} WhatsApp documents`);
    
    whatsappQuery.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   Document ${index + 1}:`);
      console.log(`   - Device ID: ${data.deviceId}`);
      console.log(`   - Total Messages: ${data.stats?.totalMessages || 0}`);
      console.log(`   - Total Contacts: ${data.stats?.totalContacts || 0}`);
      console.log(`   - Total Business Data: ${data.stats?.totalBusinessData || 0}`);
      console.log(`   - Last Updated: ${data.lastUpdated?.toDate?.() || data.lastUpdated}`);
      console.log('');
    });

    // Test 2: Check subcollections for first WhatsApp document
    if (!whatsappQuery.empty) {
      const firstDoc = whatsappQuery.docs[0];
      const docId = firstDoc.id;
      const data = firstDoc.data();
      
      console.log(`2️⃣ Checking subcollections for device: ${data.deviceId}`);
      
      // Check messages subcollection
      const messagesQuery = await db.collection('whatsapp').doc(docId).collection('messages').get();
      console.log(`   📨 Messages subcollection: ${messagesQuery.size} documents`);
      
      // Check contacts subcollection
      const contactsQuery = await db.collection('whatsapp').doc(docId).collection('contacts').get();
      console.log(`   👥 Contacts subcollection: ${contactsQuery.size} documents`);
      
      // Check business subcollection
      const businessQuery = await db.collection('whatsapp').doc(docId).collection('business').get();
      console.log(`   🏢 Business subcollection: ${businessQuery.size} documents`);
      
      console.log('');
    }

    // Test 3: Check contacts collection
    console.log('3️⃣ Checking contacts collection...');
    const contactsQuery = await db.collection('contacts').get();
    console.log(`📱 Found ${contactsQuery.size} contact documents`);
    
    // Group by device
    const contactsByDevice = {};
    contactsQuery.docs.forEach(doc => {
      const data = doc.data();
      const deviceId = data.deviceId;
      if (!contactsByDevice[deviceId]) {
        contactsByDevice[deviceId] = 0;
      }
      contactsByDevice[deviceId]++;
    });
    
    Object.entries(contactsByDevice).forEach(([deviceId, count]) => {
      console.log(`   Device ${deviceId}: ${count} contacts`);
    });
    console.log('');

    // Test 4: Check SMS collection
    console.log('4️⃣ Checking SMS collection...');
    const smsQuery = await db.collection('sms').get();
    console.log(`💬 Found ${smsQuery.size} SMS documents`);
    
    // Group by device
    const smsByDevice = {};
    smsQuery.docs.forEach(doc => {
      const data = doc.data();
      const deviceId = data.deviceId;
      if (!smsByDevice[deviceId]) {
        smsByDevice[deviceId] = 0;
      }
      smsByDevice[deviceId]++;
    });
    
    Object.entries(smsByDevice).forEach(([deviceId, count]) => {
      console.log(`   Device ${deviceId}: ${count} SMS messages`);
    });
    console.log('');

    // Test 5: Test pagination endpoint
    console.log('5️⃣ Testing pagination endpoint...');
    const testDeviceId = whatsappQuery.empty ? 'test-device' : whatsappQuery.docs[0].data().deviceId;
    console.log(`   Testing with device: ${testDeviceId}`);
    
    // This would be a real API call, but we'll simulate the query
    const paginationTest = await db.collection('whatsapp')
      .where('deviceId', '==', testDeviceId)
      .limit(1)
      .get();
    
    if (!paginationTest.empty) {
      console.log(`   ✅ Pagination query successful for device ${testDeviceId}`);
    } else {
      console.log(`   ⚠️ No WhatsApp data found for device ${testDeviceId}`);
    }

    console.log('\n✅ Optimized structure test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - WhatsApp documents: ${whatsappQuery.size} (should be 1 per device)`);
    console.log(`   - Contact documents: ${contactsQuery.size} (individual contacts)`);
    console.log(`   - SMS documents: ${smsQuery.size} (individual messages)`);
    console.log(`   - Devices with contacts: ${Object.keys(contactsByDevice).length}`);
    console.log(`   - Devices with SMS: ${Object.keys(smsByDevice).length}`);

  } catch (error) {
    console.error('❌ Error testing optimized structure:', error);
  }
}

// Run the test
testOptimizedStructure().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 