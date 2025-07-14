const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

async function seedTestUser() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'mob_notifications',
    });
    console.log('Connected to MongoDB');

    const email = 'test@example.com';
    const password = 'Test1234';
    const username = 'testuser';

    let user = await User.findOne({ email });
    if (user) {
      console.log('Test user already exists:', email);
    } else {
      user = new User({ username, email, password });
      await user.save();
      console.log('Test user created:', email);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error seeding test user:', err);
    process.exit(1);
  }
}

seedTestUser(); 