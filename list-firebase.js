const { db } = require('./backend/config/firebase');

async function listFirebaseData() {
  console.log('📋 Listing all Firebase data...\n');
  
  try {
    // List all collections
    const collections = await db.listCollections();
    console.log('📁 Collections found:', collections.map(col => col.id));
    
    // Check each collection
    for (const collection of collections) {
      console.log(`\n🔍 Checking collection: ${collection.id}`);
      
      const snapshot = await collection.get();
      console.log(`   Documents in ${collection.id}: ${snapshot.docs.length}`);
      
      if (snapshot.docs.length > 0) {
        console.log(`   Document IDs: ${snapshot.docs.map(doc => doc.id).join(', ')}`);
        
        // Check subcollections for each document
        for (const doc of snapshot.docs.slice(0, 3)) { // Only check first 3 docs
          const subcollections = await doc.ref.listCollections();
          if (subcollections.length > 0) {
            console.log(`   📂 Subcollections in ${doc.id}: ${subcollections.map(sub => sub.id).join(', ')}`);
            
            // Check subcollection contents
            for (const subcol of subcollections) {
              const subSnapshot = await subcol.get();
              console.log(`      📄 ${subcol.id}: ${subSnapshot.docs.length} documents`);
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error listing Firebase data:', error);
  }
}

// Run the list function
listFirebaseData(); 