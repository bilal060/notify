const { db } = require('./config/firebase');

async function testFirebaseWrite() {
  console.log('🧪 Testing Firebase Write...\n');

  try {
    // Test simple write to Firestore
    console.log('1. Testing simple Firestore write...');
    const docRef = db.collection('test').doc('test-doc');
    
    await docRef.set({
      message: 'Hello Firebase!',
      timestamp: new Date(),
      test: true
    });

    console.log('✅ Successfully wrote to Firestore');

    // Test reading back to verify
    console.log('\n2. Testing Firestore read...');
    const doc = await docRef.get();
    
    if (doc.exists) {
      console.log('✅ Successfully read from Firestore:', doc.data());
    } else {
      console.log('❌ Document not found');
    }

    // Test notifications collection
    console.log('\n3. Testing notifications collection...');
    const notificationRef = db.collection('notifications').doc();
    
    await notificationRef.set({
      deviceId: 'test-device',
      title: 'Test Notification',
      body: 'Test body',
      appName: 'Test App',
      packageName: 'com.test.app',
      timestamp: new Date(),
      firebaseId: notificationRef.id,
      createdAt: new Date()
    });

    console.log('✅ Successfully wrote to notifications collection');

    // Test devices collection
    console.log('\n4. Testing devices collection...');
    const deviceRef = db.collection('devices').doc('test-device');
    
    await deviceRef.set({
      deviceId: 'test-device',
      deviceInfo: {
        manufacturer: 'Samsung',
        model: 'Galaxy S23',
        androidVersion: '13',
        sdkVersion: '33',
        lastUpdated: new Date()
      },
      timestamp: new Date(),
      createdAt: new Date()
    }, { merge: true });

    console.log('✅ Successfully wrote to devices collection');

    console.log('\n🎉 All Firebase write tests completed successfully!');
    console.log('📊 Check your Firebase Console to see the data');

  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

// Run the test
testFirebaseWrite(); 