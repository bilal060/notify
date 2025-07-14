const mongoose = require('mongoose');
const User = require('./models/User');
const Video = require('./models/Video');
require('dotenv').config();

// Sample video data for each category
const sampleVideos = {
  Cartoons: [
    {
      title: "Tom and Jerry Chase Scene",
      description: "Classic cartoon chase between Tom and Jerry with hilarious antics and clever escapes.",
      filename: "tom_jerry_chase.mp4",
      originalName: "tom_jerry_chase.mp4",
      filePath: "/uploads/cartoons/tom_jerry_chase.mp4",
      fileSize: 15420000,
      duration: 180,
      views: 1250,
      likes: 89
    },
    {
      title: "Looney Tunes - Road Runner",
      description: "Wile E. Coyote's latest attempt to catch the Road Runner with ACME gadgets.",
      filename: "road_runner_chase.mp4",
      originalName: "road_runner_chase.mp4",
      filePath: "/uploads/cartoons/road_runner_chase.mp4",
      fileSize: 12850000,
      duration: 150,
      views: 980,
      likes: 67
    },
    {
      title: "SpongeBob SquarePants - Krusty Krab",
      description: "SpongeBob working at the Krusty Krab with his signature enthusiasm.",
      filename: "spongebob_krusty_krab.mp4",
      originalName: "spongebob_krusty_krab.mp4",
      filePath: "/uploads/cartoons/spongebob_krusty_krab.mp4",
      fileSize: 18730000,
      duration: 210,
      views: 2100,
      likes: 145
    },
    {
      title: "The Simpsons - Homer's Donut",
      description: "Homer Simpson's love affair with donuts at the Kwik-E-Mart.",
      filename: "homer_donut.mp4",
      originalName: "homer_donut.mp4",
      filePath: "/uploads/cartoons/homer_donut.mp4",
      fileSize: 16540000,
      duration: 195,
      views: 1670,
      likes: 112
    },
    {
      title: "Adventure Time - Finn and Jake",
      description: "Finn and Jake's latest adventure in the Land of Ooo.",
      filename: "adventure_time_finn_jake.mp4",
      originalName: "adventure_time_finn_jake.mp4",
      filePath: "/uploads/cartoons/adventure_time_finn_jake.mp4",
      fileSize: 14280000,
      duration: 165,
      views: 890,
      likes: 78
    },
    {
      title: "Rick and Morty - Portal Adventure",
      description: "Rick and Morty traveling through interdimensional portals.",
      filename: "rick_morty_portal.mp4",
      originalName: "rick_morty_portal.mp4",
      filePath: "/uploads/cartoons/rick_morty_portal.mp4",
      fileSize: 19870000,
      duration: 225,
      views: 3200,
      likes: 234
    },
    {
      title: "Gravity Falls - Mystery Shack",
      description: "Dipper and Mabel exploring the mysterious Gravity Falls.",
      filename: "gravity_falls_mystery.mp4",
      originalName: "gravity_falls_mystery.mp4",
      filePath: "/uploads/cartoons/gravity_falls_mystery.mp4",
      fileSize: 17650000,
      duration: 200,
      views: 1450,
      likes: 98
    },
    {
      title: "Steven Universe - Crystal Gems",
      description: "Steven and the Crystal Gems protecting Beach City.",
      filename: "steven_universe_crystal_gems.mp4",
      originalName: "steven_universe_crystal_gems.mp4",
      filePath: "/uploads/cartoons/steven_universe_crystal_gems.mp4",
      fileSize: 18920000,
      duration: 220,
      views: 1780,
      likes: 134
    },
    {
      title: "Regular Show - Mordecai and Rigby",
      description: "Mordecai and Rigby's daily adventures at the park.",
      filename: "regular_show_mordecai_rigby.mp4",
      originalName: "regular_show_mordecai_rigby.mp4",
      filePath: "/uploads/cartoons/regular_show_mordecai_rigby.mp4",
      fileSize: 15670000,
      duration: 185,
      views: 1120,
      likes: 87
    },
    {
      title: "Avatar: The Last Airbender - Bending",
      description: "Aang mastering the four elements of bending.",
      filename: "avatar_bending.mp4",
      originalName: "avatar_bending.mp4",
      filePath: "/uploads/cartoons/avatar_bending.mp4",
      fileSize: 20340000,
      duration: 240,
      views: 2800,
      likes: 198
    }
  ],
  Sports: [
    {
      title: "Soccer - Amazing Goal",
      description: "Incredible long-range goal from midfield in a professional match.",
      filename: "soccer_amazing_goal.mp4",
      originalName: "soccer_amazing_goal.mp4",
      filePath: "/uploads/sports/soccer_amazing_goal.mp4",
      fileSize: 18750000,
      duration: 210,
      views: 3400,
      likes: 267
    },
    {
      title: "Basketball - Slam Dunk",
      description: "Powerful slam dunk that shook the entire arena.",
      filename: "basketball_slam_dunk.mp4",
      originalName: "basketball_slam_dunk.mp4",
      filePath: "/uploads/sports/basketball_slam_dunk.mp4",
      fileSize: 16520000,
      duration: 180,
      views: 2900,
      likes: 234
    },
    {
      title: "Tennis - Epic Rally",
      description: "Incredible 30-shot rally between two tennis champions.",
      filename: "tennis_epic_rally.mp4",
      originalName: "tennis_epic_rally.mp4",
      filePath: "/uploads/sports/tennis_epic_rally.mp4",
      fileSize: 19870000,
      duration: 225,
      views: 2100,
      likes: 189
    },
    {
      title: "Baseball - Home Run",
      description: "Walk-off home run in the bottom of the 9th inning.",
      filename: "baseball_home_run.mp4",
      originalName: "baseball_home_run.mp4",
      filePath: "/uploads/sports/baseball_home_run.mp4",
      fileSize: 14560000,
      duration: 165,
      views: 1780,
      likes: 145
    },
    {
      title: "American Football - Touchdown",
      description: "Spectacular touchdown catch in the end zone.",
      filename: "football_touchdown.mp4",
      originalName: "football_touchdown.mp4",
      filePath: "/uploads/sports/football_touchdown.mp4",
      fileSize: 17680000,
      duration: 195,
      views: 3200,
      likes: 278
    },
    {
      title: "Swimming - Olympic Record",
      description: "New Olympic record in the 100m freestyle.",
      filename: "swimming_olympic_record.mp4",
      originalName: "swimming_olympic_record.mp4",
      filePath: "/uploads/sports/swimming_olympic_record.mp4",
      fileSize: 13420000,
      duration: 150,
      views: 1560,
      likes: 123
    },
    {
      title: "Gymnastics - Perfect Routine",
      description: "Flawless gymnastics routine with perfect landings.",
      filename: "gymnastics_perfect_routine.mp4",
      originalName: "gymnastics_perfect_routine.mp4",
      filePath: "/uploads/sports/gymnastics_perfect_routine.mp4",
      fileSize: 18950000,
      duration: 210,
      views: 2340,
      likes: 198
    },
    {
      title: "Volleyball - Spike",
      description: "Powerful spike that the defense couldn't handle.",
      filename: "volleyball_spike.mp4",
      originalName: "volleyball_spike.mp4",
      filePath: "/uploads/sports/volleyball_spike.mp4",
      fileSize: 15670000,
      duration: 175,
      views: 1340,
      likes: 112
    },
    {
      title: "Track and Field - Sprint",
      description: "Incredible 100m sprint finish with photo finish.",
      filename: "track_sprint.mp4",
      originalName: "track_sprint.mp4",
      filePath: "/uploads/sports/track_sprint.mp4",
      fileSize: 12340000,
      duration: 140,
      views: 1890,
      likes: 167
    },
    {
      title: "Boxing - Knockout",
      description: "Dramatic knockout punch in the final round.",
      filename: "boxing_knockout.mp4",
      originalName: "boxing_knockout.mp4",
      filePath: "/uploads/sports/boxing_knockout.mp4",
      fileSize: 16780000,
      duration: 185,
      views: 4100,
      likes: 345
    }
  ],
  Funny: [
    {
      title: "Cat Fails Compilation",
      description: "Hilarious compilation of cats doing silly things and failing spectacularly.",
      filename: "cat_fails_compilation.mp4",
      originalName: "cat_fails_compilation.mp4",
      filePath: "/uploads/funny/cat_fails_compilation.mp4",
      fileSize: 23450000,
      duration: 280,
      views: 8900,
      likes: 567
    },
    {
      title: "Dad Jokes Gone Wrong",
      description: "Collection of dad jokes that are so bad they're actually funny.",
      filename: "dad_jokes_gone_wrong.mp4",
      originalName: "dad_jokes_gone_wrong.mp4",
      filePath: "/uploads/funny/dad_jokes_gone_wrong.mp4",
      fileSize: 18760000,
      duration: 220,
      views: 6700,
      likes: 445
    },
    {
      title: "Prank Gone Wrong",
      description: "Epic prank that backfired in the most hilarious way possible.",
      filename: "prank_gone_wrong.mp4",
      originalName: "prank_gone_wrong.mp4",
      filePath: "/uploads/funny/prank_gone_wrong.mp4",
      fileSize: 19870000,
      duration: 240,
      views: 7800,
      likes: 623
    },
    {
      title: "Dance Moves Fails",
      description: "People attempting dance moves and failing spectacularly.",
      filename: "dance_moves_fails.mp4",
      originalName: "dance_moves_fails.mp4",
      filePath: "/uploads/funny/dance_moves_fails.mp4",
      fileSize: 21230000,
      duration: 260,
      views: 5600,
      likes: 389
    },
    {
      title: "Cooking Disaster",
      description: "Epic cooking fail that turned into a kitchen disaster.",
      filename: "cooking_disaster.mp4",
      originalName: "cooking_disaster.mp4",
      filePath: "/uploads/funny/cooking_disaster.mp4",
      fileSize: 17650000,
      duration: 200,
      views: 4500,
      likes: 312
    },
    {
      title: "Baby Laughing",
      description: "Infectious baby laughter that will make anyone smile.",
      filename: "baby_laughing.mp4",
      originalName: "baby_laughing.mp4",
      filePath: "/uploads/funny/baby_laughing.mp4",
      fileSize: 14560000,
      duration: 165,
      views: 12000,
      likes: 890
    },
    {
      title: "Pet vs Owner",
      description: "Funny moments between pets and their owners.",
      filename: "pet_vs_owner.mp4",
      originalName: "pet_vs_owner.mp4",
      filePath: "/uploads/funny/pet_vs_owner.mp4",
      fileSize: 19870000,
      duration: 235,
      views: 8900,
      likes: 678
    },
    {
      title: "Workout Fails",
      description: "People attempting workouts and failing in hilarious ways.",
      filename: "workout_fails.mp4",
      originalName: "workout_fails.mp4",
      filePath: "/uploads/funny/workout_fails.mp4",
      fileSize: 22340000,
      duration: 270,
      views: 6700,
      likes: 456
    },
    {
      title: "Technology Fails",
      description: "Funny moments when technology doesn't work as expected.",
      filename: "technology_fails.mp4",
      originalName: "technology_fails.mp4",
      filePath: "/uploads/funny/technology_fails.mp4",
      fileSize: 18760000,
      duration: 220,
      views: 5400,
      likes: 378
    },
    {
      title: "School Bloopers",
      description: "Funny moments from school and classroom bloopers.",
      filename: "school_bloopers.mp4",
      originalName: "school_bloopers.mp4",
      filePath: "/uploads/funny/school_bloopers.mp4",
      fileSize: 16540000,
      duration: 190,
      views: 3800,
      likes: 267
    }
  ],
  Nature: [
    {
      title: "Sunset at the Beach",
      description: "Beautiful sunset over the ocean with waves crashing on the shore.",
      filename: "sunset_beach.mp4",
      originalName: "sunset_beach.mp4",
      filePath: "/uploads/nature/sunset_beach.mp4",
      fileSize: 23450000,
      duration: 300,
      views: 5600,
      likes: 445
    },
    {
      title: "Mountain Waterfall",
      description: "Majestic waterfall cascading down mountain rocks in the forest.",
      filename: "mountain_waterfall.mp4",
      originalName: "mountain_waterfall.mp4",
      filePath: "/uploads/nature/mountain_waterfall.mp4",
      fileSize: 28760000,
      duration: 360,
      views: 4200,
      likes: 334
    },
    {
      title: "Wildlife Safari",
      description: "Lions, elephants, and other wildlife in their natural habitat.",
      filename: "wildlife_safari.mp4",
      originalName: "wildlife_safari.mp4",
      filePath: "/uploads/nature/wildlife_safari.mp4",
      fileSize: 34560000,
      duration: 420,
      views: 7800,
      likes: 623
    },
    {
      title: "Forest Birds",
      description: "Colorful birds singing and flying through the dense forest.",
      filename: "forest_birds.mp4",
      originalName: "forest_birds.mp4",
      filePath: "/uploads/nature/forest_birds.mp4",
      fileSize: 19870000,
      duration: 240,
      views: 3400,
      likes: 267
    },
    {
      title: "Ocean Waves",
      description: "Calming ocean waves crashing against the rocky coastline.",
      filename: "ocean_waves.mp4",
      originalName: "ocean_waves.mp4",
      filePath: "/uploads/nature/ocean_waves.mp4",
      fileSize: 25670000,
      duration: 320,
      views: 6700,
      likes: 534
    },
    {
      title: "Desert Sunset",
      description: "Stunning sunset over sand dunes in the desert.",
      filename: "desert_sunset.mp4",
      originalName: "desert_sunset.mp4",
      filePath: "/uploads/nature/desert_sunset.mp4",
      fileSize: 22340000,
      duration: 280,
      views: 4500,
      likes: 356
    },
    {
      title: "Rainforest Canopy",
      description: "Aerial view of the lush rainforest canopy from above.",
      filename: "rainforest_canopy.mp4",
      originalName: "rainforest_canopy.mp4",
      filePath: "/uploads/nature/rainforest_canopy.mp4",
      fileSize: 29870000,
      duration: 380,
      views: 5600,
      likes: 445
    },
    {
      title: "Northern Lights",
      description: "Aurora borealis dancing across the night sky.",
      filename: "northern_lights.mp4",
      originalName: "northern_lights.mp4",
      filePath: "/uploads/nature/northern_lights.mp4",
      fileSize: 31230000,
      duration: 400,
      views: 8900,
      likes: 712
    },
    {
      title: "Butterfly Garden",
      description: "Colorful butterflies fluttering around beautiful flowers.",
      filename: "butterfly_garden.mp4",
      originalName: "butterfly_garden.mp4",
      filePath: "/uploads/nature/butterfly_garden.mp4",
      fileSize: 18760000,
      duration: 220,
      views: 3800,
      likes: 298
    },
    {
      title: "Mountain Peak",
      description: "Breathtaking view from the top of a snow-capped mountain.",
      filename: "mountain_peak.mp4",
      originalName: "mountain_peak.mp4",
      filePath: "/uploads/nature/mountain_peak.mp4",
      fileSize: 26780000,
      duration: 340,
      views: 5200,
      likes: 423
    }
  ],
  Technology: [
    {
      title: "AI Robot Demo",
      description: "Advanced AI robot demonstrating human-like movements and interactions.",
      filename: "ai_robot_demo.mp4",
      originalName: "ai_robot_demo.mp4",
      filePath: "/uploads/technology/ai_robot_demo.mp4",
      fileSize: 34560000,
      duration: 420,
      views: 12000,
      likes: 890
    },
    {
      title: "Virtual Reality Gaming",
      description: "Immersive VR gaming experience with realistic graphics and interactions.",
      filename: "vr_gaming.mp4",
      originalName: "vr_gaming.mp4",
      filePath: "/uploads/technology/vr_gaming.mp4",
      fileSize: 29870000,
      duration: 380,
      views: 8900,
      likes: 678
    },
    {
      title: "Drone Aerial Footage",
      description: "Stunning aerial footage captured by advanced drone technology.",
      filename: "drone_aerial.mp4",
      originalName: "drone_aerial.mp4",
      filePath: "/uploads/technology/drone_aerial.mp4",
      fileSize: 26780000,
      duration: 340,
      views: 6700,
      likes: 534
    },
    {
      title: "3D Printing Process",
      description: "Fascinating 3D printing process creating complex objects layer by layer.",
      filename: "3d_printing_process.mp4",
      originalName: "3d_printing_process.mp4",
      filePath: "/uploads/technology/3d_printing_process.mp4",
      fileSize: 23450000,
      duration: 300,
      views: 5400,
      likes: 423
    },
    {
      title: "Smart Home Automation",
      description: "Modern smart home with automated lighting, security, and appliances.",
      filename: "smart_home_automation.mp4",
      originalName: "smart_home_automation.mp4",
      filePath: "/uploads/technology/smart_home_automation.mp4",
      fileSize: 25670000,
      duration: 320,
      views: 7800,
      likes: 612
    },
    {
      title: "Electric Car Technology",
      description: "Latest electric car technology with advanced features and performance.",
      filename: "electric_car_tech.mp4",
      originalName: "electric_car_tech.mp4",
      filePath: "/uploads/technology/electric_car_tech.mp4",
      fileSize: 31230000,
      duration: 400,
      views: 9800,
      likes: 745
    },
    {
      title: "Quantum Computing",
      description: "Breakthrough in quantum computing technology and its applications.",
      filename: "quantum_computing.mp4",
      originalName: "quantum_computing.mp4",
      filePath: "/uploads/technology/quantum_computing.mp4",
      fileSize: 28760000,
      duration: 360,
      views: 6700,
      likes: 534
    },
    {
      title: "Augmented Reality",
      description: "AR technology overlaying digital information on the real world.",
      filename: "augmented_reality.mp4",
      originalName: "augmented_reality.mp4",
      filePath: "/uploads/technology/augmented_reality.mp4",
      fileSize: 22340000,
      duration: 280,
      views: 5600,
      likes: 445
    },
    {
      title: "Blockchain Technology",
      description: "Understanding blockchain technology and cryptocurrency applications.",
      filename: "blockchain_technology.mp4",
      originalName: "blockchain_technology.mp4",
      filePath: "/uploads/technology/blockchain_technology.mp4",
      fileSize: 19870000,
      duration: 240,
      views: 4500,
      likes: 356
    },
    {
      title: "Space Technology",
      description: "Latest developments in space technology and satellite systems.",
      filename: "space_technology.mp4",
      originalName: "space_technology.mp4",
      filePath: "/uploads/technology/space_technology.mp4",
      fileSize: 34560000,
      duration: 420,
      views: 11000,
      likes: 823
    }
  ]
};

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/mob_notifications', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'mob_notifications'
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Create a test user if it doesn't exist
async function createTestUser() {
  try {
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        deviceId: 'test-device-123'
      });
      await user.save();
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user already exists');
    }
    
    return user;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
}

// Seed videos for all categories
async function seedVideos(user) {
  try {
    let totalVideos = 0;
    
    for (const [category, videos] of Object.entries(sampleVideos)) {
      console.log(`\n📹 Seeding ${category} videos...`);
      
      for (const videoData of videos) {
        // Check if video already exists
        const existingVideo = await Video.findOne({
          title: videoData.title,
          category: category
        });
        
        if (!existingVideo) {
          const video = new Video({
            ...videoData,
            category: category,
            userId: user._id,
            deviceId: user.deviceId || 'jumpy-admin-device'
          });
          
          await video.save();
          totalVideos++;
          console.log(`  ✅ Added: ${videoData.title}`);
        } else {
          console.log(`  ⏭️  Skipped: ${videoData.title} (already exists)`);
        }
      }
    }
    
    console.log(`\n🎉 Successfully seeded ${totalVideos} new videos!`);
    
    // Display summary
    const categoryCounts = await Video.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📊 Video Summary by Category:');
    categoryCounts.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} videos`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding videos:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting video seeding process...\n');
    
    await connectDB();
    const user = await createTestUser();
    await seedVideos(user);
    
    console.log('\n✅ Video seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { seedVideos, sampleVideos }; 