const { db } = require('./config/firebase');

async function checkWhatsAppSubcollections() {
  try {
    console.log('🔍 Checking WhatsApp collection and subcollections...\n');
    
    // Get all WhatsApp documents
    const whatsappQuery = await db.collection('whatsapp').get();
    
    console.log(`📊 WhatsApp collection: ${whatsappQuery.size} documents`);
    
    if (whatsappQuery.empty) {
      console.log('✅ No WhatsApp documents found');
      return;
    }
    
    // Check each WhatsApp document for subcollections
    for (const doc of whatsappQuery.docs) {
      console.log(`\n📱 WhatsApp document: ${doc.id}`);
      
      try {
        // Get subcollections
        const subcollections = await doc.ref.listCollections();
        
        if (subcollections.length === 0) {
          console.log('   No subcollections found');
        } else {
          console.log(`   Subcollections: ${subcollections.map(col => col.id).join(', ')}`);
          
          // Check each subcollection
          for (const subcol of subcollections) {
            const subcolQuery = await subcol.get();
            console.log(`   📁 ${subcol.id}: ${subcolQuery.size} documents`);
            
            if (subcolQuery.size > 0 && subcolQuery.size <= 3) {
              // Show sample data
              subcolQuery.docs.forEach((subdoc, index) => {
                const data = subdoc.data();
                console.log(`     ${index + 1}. ${data.name || data.contactId || subdoc.id}`);
              });
            }
          }
        }
      } catch (error) {
        console.log(`   ❌ Error checking subcollections: ${error.message}`);
      }
    }
    
    console.log('\n✅ WhatsApp subcollection check complete');
    
  } catch (error) {
    console.error('❌ Error checking WhatsApp subcollections:', error);
  }
}

// Run the check
checkWhatsAppSubcollections(); 