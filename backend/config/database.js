const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected) {
        console.log('✅ Already connected to MongoDB');
        return;
      }

      const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/notification_system';
      
      console.log('🔗 Connecting to MongoDB...');
      console.log('📊 Database URL:', mongoUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

      this.connection = await mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'mob_notifications',
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        bufferMaxEntries: 0,
      });

      this.isConnected = true;

      console.log('✅ MongoDB connected successfully to mob_notifications database');
      console.log('🔗 Database URL:', mongoUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

      // Set up connection event handlers
      mongoose.connection.on('error', this.handleError.bind(this));
      mongoose.connection.on('disconnected', this.handleDisconnect.bind(this));
      mongoose.connection.on('reconnected', this.handleReconnect.bind(this));

    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log('🔌 MongoDB disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
    }
  }

  handleError(error) {
    console.error('❌ MongoDB connection error:', error);
    this.isConnected = false;
  }

  handleDisconnect() {
    console.log('⚠️ MongoDB disconnected');
    this.isConnected = false;
  }

  handleReconnect() {
    console.log('✅ MongoDB reconnected');
    this.isConnected = true;
  }

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return this.isConnected;
  }

  // Health check
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected', message: 'Database not connected' };
      }

      await mongoose.connection.db.admin().ping();
      return { status: 'healthy', message: 'Database connection is healthy' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }
}

module.exports = new Database(); 