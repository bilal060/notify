const mongoose = require('mongoose');
const User = require('./models/User');
const Video = require('./models/Video');
require('dotenv').config();

// Famous football videos - Best Goalkeepers and Best Goals
const footballVideos = [
  // Best Goalkeeper Saves
  {
    title: "Gordon Banks - Save of the Century",
    description: "England's Gordon Banks makes the impossible save against Pele in the 1970 World Cup - widely considered the greatest save ever made.",
    filename: "gordon_banks_save_1970.mp4",
    originalName: "gordon_banks_save_1970.mp4",
    filePath: "/uploads/sports/gordon_banks_save_1970.mp4",
    fileSize: 18450000,
    duration: 240,
    views: 8500,
    likes: 1200,
    category: "Sports"
  },
  {
    title: "Lev Yashin - The Black Spider",
    description: "Compilation of legendary Soviet goalkeeper Lev Yashin's most incredible saves from the 1950s and 1960s.",
    filename: "lev_yashin_black_spider.mp4",
    originalName: "lev_yashin_black_spider.mp4",
    filePath: "/uploads/sports/lev_yashin_black_spider.mp4",
    fileSize: 22100000,
    duration: 320,
    views: 6200,
    likes: 890,
    category: "Sports"
  },
  {
    title: "Peter Schmeichel - Manchester United Legend",
    description: "Best saves from Peter Schmeichel's career at Manchester United, including his iconic starfish save technique.",
    filename: "peter_schmeichel_man_utd.mp4",
    originalName: "peter_schmeichel_man_utd.mp4",
    filePath: "/uploads/sports/peter_schmeichel_man_utd.mp4",
    fileSize: 19800000,
    duration: 280,
    views: 7400,
    likes: 1100,
    category: "Sports"
  },
  {
    title: "Oliver Kahn - The Titan",
    description: "Bayern Munich and Germany's Oliver Kahn at his best - incredible reflexes and commanding presence in goal.",
    filename: "oliver_kahn_titan.mp4",
    originalName: "oliver_kahn_titan.mp4",
    filePath: "/uploads/sports/oliver_kahn_titan.mp4",
    fileSize: 20500000,
    duration: 300,
    views: 6800,
    likes: 950,
    category: "Sports"
  },
  {
    title: "Gianluigi Buffon - Italian Wall",
    description: "Juventus legend Gianluigi Buffon's most spectacular saves throughout his illustrious career.",
    filename: "gianluigi_buffon_italian_wall.mp4",
    originalName: "gianluigi_buffon_italian_wall.mp4",
    filePath: "/uploads/sports/gianluigi_buffon_italian_wall.mp4",
    fileSize: 21500000,
    duration: 310,
    views: 7200,
    likes: 1050,
    category: "Sports"
  },
  {
    title: "Iker Casillas - Saint Iker",
    description: "Real Madrid and Spain's Iker Casillas - lightning-fast reflexes and crucial saves in Champions League finals.",
    filename: "iker_casillas_saint_iker.mp4",
    originalName: "iker_casillas_saint_iker.mp4",
    filePath: "/uploads/sports/iker_casillas_saint_iker.mp4",
    fileSize: 19200000,
    duration: 275,
    views: 6900,
    likes: 980,
    category: "Sports"
  },
  {
    title: "Manuel Neuer - The Sweeper Keeper",
    description: "Bayern Munich's Manuel Neuer revolutionizing the goalkeeper position with his sweeper-keeper style.",
    filename: "manuel_neuer_sweeper_keeper.mp4",
    originalName: "manuel_neuer_sweeper_keeper.mp4",
    filePath: "/uploads/sports/manuel_neuer_sweeper_keeper.mp4",
    fileSize: 20800000,
    duration: 290,
    views: 7600,
    likes: 1150,
    category: "Sports"
  },
  {
    title: "Alisson Becker - Liverpool's Savior",
    description: "Liverpool's Alisson Becker's most crucial saves that helped win Premier League and Champions League titles.",
    filename: "alisson_becker_liverpool.mp4",
    originalName: "alisson_becker_liverpool.mp4",
    filePath: "/uploads/sports/alisson_becker_liverpool.mp4",
    fileSize: 18900000,
    duration: 265,
    views: 8100,
    likes: 1250,
    category: "Sports"
  },
  {
    title: "Thibaut Courtois - Real Madrid Hero",
    description: "Thibaut Courtois's incredible performance in the 2022 Champions League final against Liverpool.",
    filename: "thibaut_courtois_real_madrid.mp4",
    originalName: "thibaut_courtois_real_madrid.mp4",
    filePath: "/uploads/sports/thibaut_courtois_real_madrid.mp4",
    fileSize: 20100000,
    duration: 285,
    views: 8900,
    likes: 1350,
    category: "Sports"
  },
  {
    title: "Ederson - Manchester City's Playmaker",
    description: "Manchester City's Ederson showcasing his incredible distribution and shot-stopping abilities.",
    filename: "ederson_man_city.mp4",
    originalName: "ederson_man_city.mp4",
    filePath: "/uploads/sports/ederson_man_city.mp4",
    fileSize: 19400000,
    duration: 270,
    views: 7300,
    likes: 1080,
    category: "Sports"
  },

  // Best Goals
  {
    title: "Diego Maradona - Goal of the Century",
    description: "Maradona's incredible solo goal against England in the 1986 World Cup - dribbling past 6 players.",
    filename: "maradona_goal_century_1986.mp4",
    originalName: "maradona_goal_century_1986.mp4",
    filePath: "/uploads/sports/maradona_goal_century_1986.mp4",
    fileSize: 22500000,
    duration: 180,
    views: 15000,
    likes: 2500,
    category: "Sports"
  },
  {
    title: "Lionel Messi - Barcelona's Greatest",
    description: "Lionel Messi's most spectacular goals for Barcelona, including his solo goal against Getafe in 2007.",
    filename: "lionel_messi_barcelona_goals.mp4",
    originalName: "lionel_messi_barcelona_goals.mp4",
    filePath: "/uploads/sports/lionel_messi_barcelona_goals.mp4",
    fileSize: 23500000,
    duration: 350,
    views: 18000,
    likes: 3200,
    category: "Sports"
  },
  {
    title: "Cristiano Ronaldo - Manchester United to Real Madrid",
    description: "Cristiano Ronaldo's most iconic goals from Manchester United and Real Madrid career.",
    filename: "cristiano_ronaldo_goals.mp4",
    originalName: "cristiano_ronaldo_goals.mp4",
    filePath: "/uploads/sports/cristiano_ronaldo_goals.mp4",
    fileSize: 22800000,
    duration: 340,
    views: 16500,
    likes: 2900,
    category: "Sports"
  },
  {
    title: "Zinedine Zidane - Champions League Final 2002",
    description: "Zinedine Zidane's spectacular volley in the 2002 Champions League final against Bayer Leverkusen.",
    filename: "zidane_champions_league_2002.mp4",
    originalName: "zidane_champions_league_2002.mp4",
    filePath: "/uploads/sports/zidane_champions_league_2002.mp4",
    fileSize: 19800000,
    duration: 120,
    views: 12000,
    likes: 2100,
    category: "Sports"
  },
  {
    title: "Roberto Carlos - Impossible Free Kick",
    description: "Roberto Carlos's physics-defying free kick against France in 1997 - the ball curves around the wall.",
    filename: "roberto_carlos_free_kick_1997.mp4",
    originalName: "roberto_carlos_free_kick_1997.mp4",
    filePath: "/uploads/sports/roberto_carlos_free_kick_1997.mp4",
    fileSize: 18500000,
    duration: 90,
    views: 13500,
    likes: 2400,
    category: "Sports"
  },
  {
    title: "Dennis Bergkamp - Arsenal Legend",
    description: "Dennis Bergkamp's most beautiful goals for Arsenal, including his famous goal against Newcastle.",
    filename: "dennis_bergkamp_arsenal.mp4",
    originalName: "dennis_bergkamp_arsenal.mp4",
    filePath: "/uploads/sports/dennis_bergkamp_arsenal.mp4",
    fileSize: 21200000,
    duration: 280,
    views: 9800,
    likes: 1600,
    category: "Sports"
  },
  {
    title: "Thierry Henry - Arsenal's King",
    description: "Thierry Henry's most spectacular goals for Arsenal, showcasing his speed and finishing ability.",
    filename: "thierry_henry_arsenal.mp4",
    originalName: "thierry_henry_arsenal.mp4",
    filePath: "/uploads/sports/thierry_henry_arsenal.mp4",
    fileSize: 21800000,
    duration: 300,
    views: 11200,
    likes: 1900,
    category: "Sports"
  },
  {
    title: "Wayne Rooney - Manchester United Icon",
    description: "Wayne Rooney's most memorable goals for Manchester United, including his bicycle kick against City.",
    filename: "wayne_rooney_man_utd.mp4",
    originalName: "wayne_rooney_man_utd.mp4",
    filePath: "/uploads/sports/wayne_rooney_man_utd.mp4",
    fileSize: 20500000,
    duration: 290,
    views: 10500,
    likes: 1800,
    category: "Sports"
  },
  {
    title: "Steven Gerrard - Liverpool Captain",
    description: "Steven Gerrard's most important goals for Liverpool, including his FA Cup final heroics.",
    filename: "steven_gerrard_liverpool.mp4",
    originalName: "steven_gerrard_liverpool.mp4",
    filePath: "/uploads/sports/steven_gerrard_liverpool.mp4",
    fileSize: 20800000,
    duration: 285,
    views: 9800,
    likes: 1650,
    category: "Sports"
  },
  {
    title: "Ronaldinho - Barcelona's Magician",
    description: "Ronaldinho's most magical moments at Barcelona, showcasing his incredible skill and creativity.",
    filename: "ronaldinho_barcelona.mp4",
    originalName: "ronaldinho_barcelona.mp4",
    filePath: "/uploads/sports/ronaldinho_barcelona.mp4",
    fileSize: 22200000,
    duration: 320,
    views: 12800,
    likes: 2200,
    category: "Sports"
  },
  {
    title: "Ronaldo Nazario - The Phenomenon",
    description: "Ronaldo Nazario's most spectacular goals for Brazil and various clubs throughout his career.",
    filename: "ronaldo_nazario_phenomenon.mp4",
    originalName: "ronaldo_nazario_phenomenon.mp4",
    filePath: "/uploads/sports/ronaldo_nazario_phenomenon.mp4",
    fileSize: 21500000,
    duration: 310,
    views: 11500,
    likes: 2000,
    category: "Sports"
  },
  {
    title: "Johan Cruyff - Total Football",
    description: "Johan Cruyff's most beautiful goals and moments that defined Total Football philosophy.",
    filename: "johan_cruyff_total_football.mp4",
    originalName: "johan_cruyff_total_football.mp4",
    filePath: "/uploads/sports/johan_cruyff_total_football.mp4",
    fileSize: 19800000,
    duration: 270,
    views: 8500,
    likes: 1400,
    category: "Sports"
  },
  {
    title: "Pele - The King of Football",
    description: "Pele's most iconic goals for Brazil and Santos, showcasing his incredible talent and skill.",
    filename: "pele_king_football.mp4",
    originalName: "pele_king_football.mp4",
    filePath: "/uploads/sports/pele_king_football.mp4",
    fileSize: 20800000,
    duration: 290,
    views: 10200,
    likes: 1750,
    category: "Sports"
  },
  {
    title: "George Best - Manchester United Legend",
    description: "George Best's most spectacular goals and skills for Manchester United in the 1960s.",
    filename: "george_best_man_utd.mp4",
    originalName: "george_best_man_utd.mp4",
    filePath: "/uploads/sports/george_best_man_utd.mp4",
    fileSize: 19200000,
    duration: 260,
    views: 7800,
    likes: 1200,
    category: "Sports"
  },
  {
    title: "Eusebio - Portugal's Golden Boy",
    description: "Eusebio's most memorable goals for Portugal and Benfica, including his 1966 World Cup heroics.",
    filename: "eusebio_portugal_benfica.mp4",
    originalName: "eusebio_portugal_benfica.mp4",
    filePath: "/uploads/sports/eusebio_portugal_benfica.mp4",
    fileSize: 19500000,
    duration: 275,
    views: 7200,
    likes: 1100,
    category: "Sports"
  }
];

const seedFootballVideos = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/mob_notifications', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'mob_notifications'
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing football videos
    await Video.deleteMany({ category: 'Sports' });
    console.log('🗑️ Cleared existing sports videos');

    // Create a default user if none exists
    let defaultUser = await User.findOne({ email: 'admin@jumpy.com' });
    if (!defaultUser) {
      defaultUser = await User.create({
        username: 'JumpyAdmin',
        email: 'admin@jumpy.com',
        password: 'admin123',
        deviceId: 'jumpy-admin-device'
      });
      console.log('👤 Created default admin user');
    }

    // Create videos with the default user
    const videosWithUser = footballVideos.map(video => ({
      ...video,
      userId: defaultUser._id,
      deviceId: defaultUser.deviceId
    }));

    const createdVideos = await Video.insertMany(videosWithUser);
    console.log(`✅ Successfully added ${createdVideos.length} football videos to the database`);

    // Display summary
    console.log('\n📊 Football Videos Summary:');
    console.log('========================');
    
    const goalkeepers = createdVideos.filter(v => v.title.toLowerCase().includes('goalkeeper') || v.title.toLowerCase().includes('save') || v.title.toLowerCase().includes('buffon') || v.title.toLowerCase().includes('casillas') || v.title.toLowerCase().includes('neuer') || v.title.toLowerCase().includes('alisson') || v.title.toLowerCase().includes('courtois') || v.title.toLowerCase().includes('ederson') || v.title.toLowerCase().includes('schmeichel') || v.title.toLowerCase().includes('kahn') || v.title.toLowerCase().includes('yashin') || v.title.toLowerCase().includes('banks'));
    const goals = createdVideos.filter(v => !goalkeepers.includes(v));
    
    console.log(`🥅 Best Goalkeeper Videos: ${goalkeepers.length}`);
    console.log(`⚽ Best Goal Videos: ${goals.length}`);
    console.log(`📹 Total Football Videos: ${createdVideos.length}`);

    console.log('\n🏆 Featured Videos:');
    console.log('==================');
    createdVideos.slice(0, 5).forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
    });

    console.log('\n🎯 Categories Covered:');
    console.log('=====================');
    console.log('• Legendary Goalkeeper Saves');
    console.log('• Iconic Football Goals');
    console.log('• World Cup Moments');
    console.log('• Champions League Highlights');
    console.log('• Premier League Classics');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('🎉 Football video seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding football videos:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedFootballVideos(); 