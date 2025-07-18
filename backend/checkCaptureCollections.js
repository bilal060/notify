const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'mob_notifications'
})
.then(() => {
    console.log('✅ Connected to MongoDB');
    checkCollections();
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
});

async function checkCollections() {
    try {
        console.log('\n🔍 Checking Capture Collections...\n');
        
        // Import models
        const CaptureMessages = require('./models/CaptureMessages');
        const CaptureEmails = require('./models/CaptureEmails');
        const CaptureVideos = require('./models/CaptureVideos');
        
        // Check CaptureMessages collection
        console.log('📱 CAPTURE MESSAGES:');
        const messages = await CaptureMessages.find({}).sort({timestamp: -1}).limit(5);
        console.log(`Total messages: ${await CaptureMessages.countDocuments()}`);
        messages.forEach((msg, index) => {
            console.log(`${index + 1}. [${msg.platform}] ${msg.sender}: ${msg.message.substring(0, 50)}...`);
        });
        
        // Check CaptureEmails collection
        console.log('\n📧 CAPTURE EMAILS:');
        const emails = await CaptureEmails.find({}).sort({timestamp: -1}).limit(5);
        console.log(`Total emails: ${await CaptureEmails.countDocuments()}`);
        emails.forEach((email, index) => {
            console.log(`${index + 1}. [${email.platform}] From: ${email.from} | Subject: ${email.subject}`);
        });
        
        // Check CaptureVideos collection
        console.log('\n🎥 CAPTURE VIDEOS:');
        const videos = await CaptureVideos.find({}).sort({timestamp: -1}).limit(5);
        console.log(`Total videos: ${await CaptureVideos.countDocuments()}`);
        videos.forEach((video, index) => {
            console.log(`${index + 1}. [${video.platform}] ${video.originalName} (${video.fileSize} bytes)`);
        });
        
        // Platform statistics
        console.log('\n📊 PLATFORM STATISTICS:');
        
        const messageStats = await CaptureMessages.aggregate([
            {
                $group: {
                    _id: '$platform',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const emailStats = await CaptureEmails.aggregate([
            {
                $group: {
                    _id: '$platform',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const videoStats = await CaptureVideos.aggregate([
            {
                $group: {
                    _id: '$platform',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        console.log('Messages by platform:', messageStats);
        console.log('Emails by platform:', emailStats);
        console.log('Videos by platform:', videoStats);
        
        console.log('\n✅ Collection check completed!');
        
    } catch (error) {
        console.error('❌ Error checking collections:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }
} 