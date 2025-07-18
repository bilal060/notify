const { db } = require('./config/firebase');

async function listAllFirebaseCollections() {
  try {
    console.log('🔍 Listing all collections in Firebase...\n');
    
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
      } catch (error) {
        console.log(`❌ ${collection.id}: Error - ${error.message}`);
      }
    }
    
    console.log('\n✅ All Firebase collections listed');
    
  } catch (error) {
    console.error('❌ Error listing Firebase collections:', error);
  }
}

// Run the check
listAllFirebaseCollections(); 