const { db } = require('./backend/config/firebase');

async function deleteSpecificDocument() {
  console.log('🗑️ Deleting specific WhatsApp document...\n');
  
  try {
    // The document ID we saw in the console
    const documentId = 'zzDlu882k4S1LPIo9eLG';
    
    console.log(`🔍 Looking for document: ${documentId}`);
    
    // Check if document exists
    const docRef = db.collection('whatsapp').doc(documentId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      console.log(`✅ Document ${documentId} found`);
      
      // List subcollections
      const subcollections = await docRef.listCollections();
      console.log(`📂 Subcollections found: ${subcollections.map(sub => sub.id).join(', ')}`);
      
      // Delete contacts subcollection
      if (subcollections.some(sub => sub.id === 'contacts')) {
        console.log('🗑️ Deleting contacts subcollection...');
        const contactsSnapshot = await docRef.collection('contacts').get();
        
        if (contactsSnapshot.docs.length > 0) {
          const batch = db.batch();
          contactsSnapshot.docs.forEach(contactDoc => {
            batch.delete(contactDoc.ref);
          });
          await batch.commit();
          console.log(`✅ Deleted ${contactsSnapshot.docs.length} contacts`);
        } else {
          console.log('ℹ️ No contacts found');
        }
      }
      
      // Delete the main document
      await docRef.delete();
      console.log(`✅ Deleted main document ${documentId}`);
      
    } else {
      console.log(`❌ Document ${documentId} not found`);
      
      // List all documents in whatsapp collection
      const snapshot = await db.collection('whatsapp').get();
      console.log(`📋 All documents in whatsapp collection: ${snapshot.docs.map(doc => doc.id).join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Error deleting document:', error);
  }
}

// Run the delete function
deleteSpecificDocument(); 