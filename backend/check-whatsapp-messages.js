const { db } = require('./config/firebase');

async function checkWhatsAppMessages() {
  console.log('🔍 Checking WhatsApp messages in subcollections...\n');

  try {
    // Get all WhatsApp documents
    const whatsappQuery = await db.collection('whatsapp').get();
    console.log(`📊 Found ${whatsappQuery.size} WhatsApp documents`);

    for (let i = 0; i < whatsappQuery.docs.length; i++) {
      const doc = whatsappQuery.docs[i];
      const data = doc.data();
      const docId = doc.id;
      
      console.log(`\n📱 Device: ${data.deviceId} (Document ID: ${docId})`);
      console.log(`   Stats: Messages: ${data.stats?.totalMessages || 0}, Contacts: ${data.stats?.totalContacts || 0}, Business: ${data.stats?.totalBusinessData || 0}`);
      
      // Check messages subcollection
      const messagesQuery = await db.collection('whatsapp').doc(docId).collection('messages').get();
      console.log(`   📨 Messages subcollection: ${messagesQuery.size} documents`);
      
      if (messagesQuery.size > 0) {
        console.log(`   Sample messages:`);
        messagesQuery.docs.slice(0, 3).forEach((msgDoc, index) => {
          const msgData = msgDoc.data();
          console.log(`     ${index + 1}. From: ${msgData.from}, To: ${msgData.to}, Body: ${msgData.body?.substring(0, 50)}...`);
        });
      }
      
      // Check contacts subcollection
      const contactsQuery = await db.collection('whatsapp').doc(docId).collection('contacts').get();
      console.log(`   👥 Contacts subcollection: ${contactsQuery.size} documents`);
      
      if (contactsQuery.size > 0) {
        console.log(`   Sample contacts:`);
        contactsQuery.docs.slice(0, 3).forEach((contactDoc, index) => {
          const contactData = contactDoc.data();
          console.log(`     ${index + 1}. Name: ${contactData.name}, Phone: ${contactData.phoneNumber}`);
        });
      }
      
      // Check business subcollection
      const businessQuery = await db.collection('whatsapp').doc(docId).collection('business').get();
      console.log(`   🏢 Business subcollection: ${businessQuery.size} documents`);
      
      if (businessQuery.size > 0) {
        console.log(`   Sample business data:`);
        businessQuery.docs.slice(0, 3).forEach((businessDoc, index) => {
          const businessData = businessDoc.data();
          console.log(`     ${index + 1}. Name: ${businessData.name}, Category: ${businessData.category}`);
        });
      }
    }

    console.log('\n✅ WhatsApp messages check completed!');

  } catch (error) {
    console.error('❌ Error checking WhatsApp messages:', error);
  }
}

// Run the check
checkWhatsAppMessages().then(() => {
  console.log('\n🏁 Check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Check failed:', error);
  process.exit(1);
}); 