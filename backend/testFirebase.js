const { db, rtdb } = require('./config/firebase');

async function testFirebase() {
  try {
    console.log('🔥 TESTING FIREBASE CONNECTIVITY\n');
    console.log('=' .repeat(60));

    // Test Firestore collections
    console.log('\n📊 FIRESTORE COLLECTIONS:');
    
    const collections = [
      'notifications',
      'facebook_harvest',
      'whatsapp_harvest', 
      'contacts',
      'monitoring_data',
      'gmail_accounts',
      'accounts',
      'messages'
    ];

    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).get();
        console.log(`✅ ${collectionName}: ${snapshot.size} documents`);
        
        // Show first few documents
        if (snapshot.size > 0) {
          console.log(`   Sample data:`);
          snapshot.docs.slice(0, 2).forEach((doc, index) => {
            const data = doc.data();
            console.log(`   ${index + 1}. ID: ${doc.id}`);
            console.log(`      Data: ${JSON.stringify(data).substring(0, 100)}...`);
          });
        }
      } catch (error) {
        console.log(`❌ ${collectionName}: Error - ${error.message}`);
      }
      console.log('');
    }

    // Test Realtime Database
    console.log('\n⚡ REALTIME DATABASE:');
    try {
      const rtdbSnapshot = await rtdb.ref().once('value');
      const rtdbData = rtdbSnapshot.val();
      
      if (rtdbData) {
        console.log('✅ Realtime Database has data:');
        Object.keys(rtdbData).forEach(key => {
          console.log(`   - ${key}: ${typeof rtdbData[key]}`);
        });
      } else {
        console.log('ℹ️  Realtime Database is empty');
      }
    } catch (error) {
      console.log(`❌ Realtime Database Error: ${error.message}`);
    }

    // Test specific sync endpoints
    console.log('\n🔄 TESTING SYNC ENDPOINTS:');
    
    const syncEndpoints = [
      '/api/firebase/sync/notifications',
      '/api/firebase/sync/messages', 
      '/api/firebase/sync/contacts',
      '/api/firebase/sync/call-logs',
      '/api/firebase/sync/emails'
    ];

    for (const endpoint of syncEndpoints) {
      try {
        const response = await fetch(`http://localhost:5001${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            deviceId: 'test-device',
            notifications: [],
            messages: [],
            contacts: [],
            callLogs: [],
            emails: []
          })
        });
        
        if (response.status === 401) {
          console.log(`✅ ${endpoint}: Endpoint exists (auth required)`);
        } else {
          console.log(`ℹ️  ${endpoint}: Status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Firebase testing completed!');

  } catch (error) {
    console.error('❌ Firebase test failed:', error);
  }
}

testFirebase(); 