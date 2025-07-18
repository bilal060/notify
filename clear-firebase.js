const { db } = require('./backend/config/firebase');

async function clearFirebase() {
  console.log('🧹 Clearing Firebase data...\n');
  
  try {
    const collections = [
      'whatsapp',
      'contacts', 
      'sms',
      'notifications',
      'facebook',
      'emails',
      'callLogs',
      'deviceInfo',
      'appsList',
      'emailAccounts',
      'media'
    ];
    
    let totalDeleted = 0;
    
    for (const collectionName of collections) {
      console.log(`🗑️ Clearing ${collectionName} collection...`);
      
      try {
        const snapshot = await db.collection(collectionName).get();
        const batch = db.batch();
        
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        if (snapshot.docs.length > 0) {
          await batch.commit();
          console.log(`✅ Deleted ${snapshot.docs.length} documents from ${collectionName}`);
          totalDeleted += snapshot.docs.length;
        } else {
          console.log(`ℹ️ No documents found in ${collectionName}`);
        }
        
        // Add delay between collections to avoid quota issues
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error clearing ${collectionName}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Firebase cleared successfully!`);
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
    
  } catch (error) {
    console.error('❌ Error clearing Firebase:', error);
  }
}

// Run the clear function
clearFirebase(); 