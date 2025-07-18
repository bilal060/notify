const { db, COLLECTIONS } = require('./config/firebase');

async function checkAllFirebaseCollections() {
  try {
    console.log('🔍 Checking all Firebase collections...\n');
    
    const collections = Object.values(COLLECTIONS);
    
    for (const collectionName of collections) {
      try {
        const query = await db.collection(collectionName).get();
        console.log(`📊 ${collectionName}: ${query.size} documents`);
        
        if (query.size > 0 && query.size <= 10) {
          // Show sample data for small collections
          console.log(`   Sample: ${query.docs.map(doc => doc.id).join(', ')}`);
        } else if (query.size > 10) {
          console.log(`   Sample: ${query.docs.slice(0, 3).map(doc => doc.id).join(', ')}... and ${query.size - 3} more`);
        }
      } catch (error) {
        console.log(`❌ ${collectionName}: Error - ${error.message}`);
      }
    }
    
    console.log('\n✅ Firebase collection check complete');
    
  } catch (error) {
    console.error('❌ Error checking Firebase collections:', error);
  }
}

// Run the check
checkAllFirebaseCollections(); 