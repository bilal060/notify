const { db, COLLECTIONS } = require('./config/firebase');

async function checkFirebaseContacts() {
  try {
    console.log('🔍 Checking Firebase contacts collection...');
    
    // Get all contacts from Firebase
    const contactsQuery = await db.collection(COLLECTIONS.CONTACTS).get();
    
    if (contactsQuery.empty) {
      console.log('✅ No contacts found in Firebase');
      return;
    }
    
    console.log(`📊 Found ${contactsQuery.size} contacts in Firebase`);
    
    // Show some sample contacts
    const sampleContacts = contactsQuery.docs.slice(0, 5);
    console.log('\n📱 Sample contacts:');
    sampleContacts.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.name || 'No name'} (${data.deviceId}) - ${data.phoneNumbers?.length || 0} phones`);
    });
    
    if (contactsQuery.size > 5) {
      console.log(`... and ${contactsQuery.size - 5} more contacts`);
    }
    
    // Ask if user wants to delete
    console.log('\n🗑️  To delete all contacts, run: node deleteFirebaseContacts.js');
    
  } catch (error) {
    console.error('❌ Error checking Firebase contacts:', error);
  }
}

async function deleteFirebaseContacts() {
  try {
    console.log('🗑️  Deleting all contacts from Firebase...');
    
    // Get all contacts from Firebase
    const contactsQuery = await db.collection(COLLECTIONS.CONTACTS).get();
    
    if (contactsQuery.empty) {
      console.log('✅ No contacts found to delete');
      return;
    }
    
    console.log(`📊 Found ${contactsQuery.size} contacts to delete`);
    
    // Delete contacts in batches (Firebase batch limit is 500)
    const batchSize = 500;
    const batches = [];
    let deletedCount = 0;

    for (let i = 0; i < contactsQuery.docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = contactsQuery.docs.slice(i, i + batchSize);
      
      batchDocs.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
      });
      
      batches.push(batch);
    }

    console.log(`🔄 Deleting ${deletedCount} contacts in ${batches.length} batches...`);

    // Execute all batches
    await Promise.all(batches.map(batch => batch.commit()));

    console.log(`✅ Successfully deleted ${deletedCount} contacts from Firebase`);
    
  } catch (error) {
    console.error('❌ Error deleting Firebase contacts:', error);
  }
}

// Check if this script is being run directly
if (require.main === module) {
  const action = process.argv[2];
  
  if (action === 'delete') {
    deleteFirebaseContacts();
  } else {
    checkFirebaseContacts();
  }
}

module.exports = { checkFirebaseContacts, deleteFirebaseContacts }; 