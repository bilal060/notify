const { db } = require('./backend/config/firebase');

async function testFirebaseConnection() {
  console.log('🧪 Testing Firebase connection...\n');
  
  try {
    // Test 1: Create a test document
    console.log('1. Creating test document...');
    const testDocRef = db.collection('test').doc('connection-test');
    await testDocRef.set({
      message: 'Test connection',
      timestamp: new Date(),
      test: true
    });
    console.log('✅ Test document created');
    
    // Test 2: Read the test document
    console.log('\n2. Reading test document...');
    const testDoc = await testDocRef.get();
    if (testDoc.exists) {
      console.log('✅ Test document read successfully:', testDoc.data());
    } else {
      console.log('❌ Test document not found');
    }
    
    // Test 3: Delete the test document
    console.log('\n3. Deleting test document...');
    await testDocRef.delete();
    console.log('✅ Test document deleted');
    
    // Test 4: Verify deletion
    console.log('\n4. Verifying deletion...');
    const deletedDoc = await testDocRef.get();
    if (!deletedDoc.exists) {
      console.log('✅ Test document successfully deleted');
    } else {
      console.log('❌ Test document still exists');
    }
    
    // Test 5: List all collections
    console.log('\n5. Listing all collections...');
    const collections = await db.listCollections();
    console.log('📁 Collections:', collections.map(col => col.id));
    
    console.log('\n🎉 Firebase connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
  }
}

// Run the test
testFirebaseConnection(); 