const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const usersToCreate = [
  {
    username: 'alice',
    email: 'alice_' + Date.now() + '@example.com',
    password: 'alicepass123',
    deviceId: 'device-alice-' + Date.now()
  },
  {
    username: 'bob',
    email: 'bob_' + Date.now() + '@example.com',
    password: 'bobpass456',
    deviceId: 'device-bob-' + Date.now()
  },
  {
    username: 'charlie',
    email: 'charlie_' + Date.now() + '@example.com',
    password: 'charliepass789',
    deviceId: 'device-charlie-' + Date.now()
  },
  {
    username: 'diana',
    email: 'diana_' + Date.now() + '@example.com',
    password: 'dianapass321',
    deviceId: 'device-diana-' + Date.now()
  },
  {
    username: 'eve',
    email: 'eve_' + Date.now() + '@example.com',
    password: 'evepass654',
    deviceId: 'device-eve-' + Date.now()
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'mob_notifications'
    });
    console.log('✅ Connected to MongoDB');

    for (const userData of usersToCreate) {
      // Ensure unique values for each run
      userData.username += '_' + Math.floor(Math.random() * 100000);
      userData.deviceId += '_' + Math.floor(Math.random() * 100000);
      userData.email = userData.email.replace('@', `_${Math.floor(Math.random() * 100000)}@`);

      const user = new User(userData);
      await user.save();
      console.log(`👤 Created user: ${user.username} | email: ${user.email} | deviceId: ${user.deviceId}`);
      // Show password in metadata
      console.log(`   - Password in metadata: ${user.getPasswordFromMetadata()}`);
      console.log(`   - uniqueId: ${user.uniqueId}`);
    }

    console.log('🎉 All users created successfully!');
  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers; 