const { db } = require('./config/firebase');

async function checkDuplicates() {
  console.log('🔍 Checking for duplicate documents and issues...\n');

  try {
    // Check WhatsApp documents
    console.log('1️⃣ Checking WhatsApp documents...');
    const whatsappQuery = await db.collection('whatsapp').get();
    console.log(`📊 Found ${whatsappQuery.size} WhatsApp documents`);
    
    const deviceCounts = {};
    whatsappQuery.docs.forEach((doc, index) => {
      const data = doc.data();
      const deviceId = data.deviceId;
      if (!deviceCounts[deviceId]) {
        deviceCounts[deviceId] = [];
      }
      deviceCounts[deviceId].push({
        docId: doc.id,
        stats: data.stats,
        timestamp: data.timestamp,
        lastUpdated: data.lastUpdated
      });
    });

    Object.entries(deviceCounts).forEach(([deviceId, docs]) => {
      console.log(`\n📱 Device: ${deviceId}`);
      console.log(`   Documents: ${docs.length}`);
      if (docs.length > 1) {
        console.log(`   ⚠️ DUPLICATE DETECTED! Multiple documents for same device`);
        docs.forEach((doc, index) => {
          console.log(`   Document ${index + 1}: ${doc.docId}`);
          console.log(`     - Messages: ${doc.stats?.totalMessages || 0}`);
          console.log(`     - Contacts: ${doc.stats?.totalContacts || 0}`);
          console.log(`     - Business: ${doc.stats?.totalBusinessData || 0}`);
          console.log(`     - Timestamp: ${doc.timestamp?.toDate?.() || doc.timestamp}`);
        });
      } else {
        console.log(`   ✅ Single document: ${docs[0].docId}`);
      }
    });

    // Check notifications
    console.log('\n2️⃣ Checking notifications...');
    const notificationsQuery = await db.collection('notifications').get();
    console.log(`📢 Found ${notificationsQuery.size} notification documents`);
    
    const notificationDevices = {};
    notificationsQuery.docs.forEach(doc => {
      const data = doc.data();
      const deviceId = data.deviceId;
      if (!notificationDevices[deviceId]) {
        notificationDevices[deviceId] = 0;
      }
      notificationDevices[deviceId]++;
    });

    Object.entries(notificationDevices).forEach(([deviceId, count]) => {
      console.log(`   Device ${deviceId}: ${count} notifications`);
    });

    // Check emails
    console.log('\n3️⃣ Checking emails...');
    const emailsQuery = await db.collection('emails').get();
    console.log(`📧 Found ${emailsQuery.size} email documents`);
    
    const emailUsers = {};
    emailsQuery.docs.forEach(doc => {
      const data = doc.data();
      const userId = data.userId;
      if (!emailUsers[userId]) {
        emailUsers[userId] = 0;
      }
      emailUsers[userId]++;
    });

    Object.entries(emailUsers).forEach(([userId, count]) => {
      console.log(`   User ${userId}: ${count} emails`);
    });

    // Check Facebook data
    console.log('\n4️⃣ Checking Facebook data...');
    const facebookQuery = await db.collection('facebook_data').get();
    console.log(`📘 Found ${facebookQuery.size} Facebook documents`);
    
    const facebookDevices = {};
    facebookQuery.docs.forEach(doc => {
      const data = doc.data();
      const deviceId = data.deviceId;
      if (!facebookDevices[deviceId]) {
        facebookDevices[deviceId] = 0;
      }
      facebookDevices[deviceId]++;
    });

    Object.entries(facebookDevices).forEach(([deviceId, count]) => {
      console.log(`   Device ${deviceId}: ${count} Facebook documents`);
    });

    // Check for email accounts configuration
    console.log('\n5️⃣ Checking for email accounts configuration...');
    const usersQuery = await db.collection('users').get();
    console.log(`👤 Found ${usersQuery.size} user documents`);
    
    usersQuery.docs.forEach(doc => {
      const data = doc.data();
      console.log(`   User: ${data.email || data.userId || 'unknown'}`);
      if (data.configuredEmails) {
        console.log(`     Configured emails: ${data.configuredEmails.length}`);
      }
    });

    console.log('\n✅ Duplicate check completed!');

  } catch (error) {
    console.error('❌ Error checking duplicates:', error);
  }
}

// Run the check
checkDuplicates().then(() => {
  console.log('\n🏁 Check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Check failed:', error);
  process.exit(1);
}); 