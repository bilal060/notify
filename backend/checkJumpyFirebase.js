const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with jumpy project
const serviceAccount = require('./jumpy-465913-08f53af635f1.json');

let firebaseApp;
try {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://jumpy-465913.firebaseio.com',
    storageBucket: 'jumpy-465913.appspot.com'
  }, 'jumpy-project');
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    firebaseApp = admin.app('jumpy-project');
  } else {
    console.error('Firebase initialization error:', error);
  }
}

const db = firebaseApp.firestore();

async function checkJumpyFirebase() {
  try {
    console.log('🔍 Checking jumpy-465913 Firebase project...\n');
    
    // Get all collections
    const collections = await db.listCollections();
    
    console.log(`📊 Found ${collections.length} collections:`);
    
    for (const collection of collections) {
      try {
        const query = await collection.get();
        console.log(`📁 ${collection.id}: ${query.size} documents`);
        
        if (query.size > 0 && query.size <= 5) {
          // Show sample document IDs for small collections
          const docIds = query.docs.map(doc => doc.id);
          console.log(`   Documents: ${docIds.join(', ')}`);
        } else if (query.size > 5) {
          const docIds = query.docs.slice(0, 3).map(doc => doc.id);
          console.log(`   Sample: ${docIds.join(', ')}... and ${query.size - 3} more`);
        }
        
        // If this is contacts collection, show more details
        if (collection.id === 'contacts' && query.size > 0) {
          console.log('\n📱 Sample contacts:');
          const sampleContacts = query.docs.slice(0, 5);
          sampleContacts.forEach((doc, index) => {
            const data = doc.data();
            console.log(`   ${index + 1}. ${data.name || 'No name'} (${data.deviceId || 'No device'}) - ${data.phoneNumbers?.length || 0} phones`);
          });
        }
      } catch (error) {
        console.log(`❌ ${collection.id}: Error - ${error.message}`);
      }
    }
    
    console.log('\n✅ jumpy-465913 Firebase project check complete');
    
  } catch (error) {
    console.error('❌ Error checking jumpy Firebase:', error);
  }
}

// Run the check
checkJumpyFirebase(); 