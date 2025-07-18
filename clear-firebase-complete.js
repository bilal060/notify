const { db } = require('./backend/config/firebase');

async function clearSubcollection(collectionPath, subcollectionName) {
  try {
    const snapshot = await db.collection(collectionPath).doc(subcollectionName).collection('contacts').get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    if (snapshot.docs.length > 0) {
      await batch.commit();
      console.log(`✅ Deleted ${snapshot.docs.length} documents from ${collectionPath}/${subcollectionName}/contacts`);
      return snapshot.docs.length;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Error clearing subcollection ${collectionPath}/${subcollectionName}/contacts:`, error.message);
    return 0;
  }
}

async function clearFirebaseComplete() {
  console.log('🧹 Clearing ALL Firebase data (including subcollections)...\n');
  
  try {
    let totalDeleted = 0;
    
    // Clear WhatsApp collection and its subcollections
    console.log('🗑️ Clearing WhatsApp collection...');
    const whatsappSnapshot = await db.collection('whatsapp').get();
    
    for (const doc of whatsappSnapshot.docs) {
      console.log(`   Clearing document: ${doc.id}`);
      
      // Clear contacts subcollection
      const contactsSnapshot = await doc.ref.collection('contacts').get();
      if (contactsSnapshot.docs.length > 0) {
        const batch = db.batch();
        contactsSnapshot.docs.forEach(contactDoc => {
          batch.delete(contactDoc.ref);
        });
        await batch.commit();
        console.log(`   ✅ Deleted ${contactsSnapshot.docs.length} contacts from ${doc.id}`);
        totalDeleted += contactsSnapshot.docs.length;
      }
      
      // Clear messages subcollection
      const messagesSnapshot = await doc.ref.collection('messages').get();
      if (messagesSnapshot.docs.length > 0) {
        const batch = db.batch();
        messagesSnapshot.docs.forEach(messageDoc => {
          batch.delete(messageDoc.ref);
        });
        await batch.commit();
        console.log(`   ✅ Deleted ${messagesSnapshot.docs.length} messages from ${doc.id}`);
        totalDeleted += messagesSnapshot.docs.length;
      }
      
      // Clear businessData subcollection
      const businessSnapshot = await doc.ref.collection('businessData').get();
      if (businessSnapshot.docs.length > 0) {
        const batch = db.batch();
        businessSnapshot.docs.forEach(businessDoc => {
          batch.delete(businessDoc.ref);
        });
        await batch.commit();
        console.log(`   ✅ Deleted ${businessSnapshot.docs.length} business data from ${doc.id}`);
        totalDeleted += businessSnapshot.docs.length;
      }
      
      // Delete the main document
      await doc.ref.delete();
      console.log(`   ✅ Deleted main document ${doc.id}`);
      
      // Add delay to avoid quota issues
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Clear other collections
    const collections = [
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
    
    console.log(`\n🎉 Firebase completely cleared!`);
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
    
  } catch (error) {
    console.error('❌ Error clearing Firebase:', error);
  }
}

// Run the complete clear function
clearFirebaseComplete(); 