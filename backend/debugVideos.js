const mongoose = require('mongoose');
const Video = require('./models/Video');
require('dotenv').config();

async function debugVideos() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'mob_notifications'
    });
    console.log('✅ Connected to MongoDB');

    // Test 1: Count all videos
    const totalVideos = await Video.countDocuments();
    console.log('📊 Total videos in database:', totalVideos);

    // Test 2: Get all categories
    const categories = await Video.distinct('category');
    console.log('📂 Categories in database:', categories);

    // Test 3: Count videos by category
    for (const category of categories) {
      const count = await Video.countDocuments({ category });
      console.log(`📁 ${category}: ${count} videos`);
    }

    // Test 4: Get sample videos from each category
    for (const category of categories) {
      const sampleVideos = await Video.find({ category }).limit(3);
      console.log(`\n🎬 Sample ${category} videos:`);
      sampleVideos.forEach(video => {
        console.log(`  - ${video.title} (ID: ${video._id})`);
      });
    }

    // Test 5: Test the exact query used in the API
    console.log('\n🔍 Testing API query for Sports category:');
    const sportsVideos = await Video.find({ category: 'Sports' })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(5);
    
    console.log(`Found ${sportsVideos.length} Sports videos`);
    sportsVideos.forEach(video => {
      console.log(`  - ${video.title} (Category: ${video.category})`);
    });

    // Test 6: Check if there are any videos without category
    const videosWithoutCategory = await Video.find({ category: { $exists: false } });
    console.log(`\n⚠️ Videos without category: ${videosWithoutCategory.length}`);

    // Test 7: Check for videos with null/empty category
    const videosWithEmptyCategory = await Video.find({ 
      $or: [
        { category: null },
        { category: '' },
        { category: { $exists: false } }
      ]
    });
    console.log(`⚠️ Videos with empty/null category: ${videosWithEmptyCategory.length}`);

    // Test 8: Check video schema
    const sampleVideo = await Video.findOne();
    if (sampleVideo) {
      console.log('\n📋 Sample video schema:');
      console.log('Keys:', Object.keys(sampleVideo.toObject()));
      console.log('Category type:', typeof sampleVideo.category);
      console.log('Category value:', sampleVideo.category);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

debugVideos(); 