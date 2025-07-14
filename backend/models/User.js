const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  uniqueId: {
    type: String,
    unique: true,
    default: uuidv4
  },
  uniqueUrl: {
    type: String,
    unique: true,
    default: function() {
      // Use uniqueId to generate a unique URL
      // If uniqueId is not set yet, generate a temp UUID
      const id = this.uniqueId || uuidv4();
      return `http://localhost:3000/monitor/${id}`;
    }
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  profilePicture: {
    type: String,
    default: null
  },
  coverPhoto: {
    type: String,
    default: null
  },
  pin: {
    type: String,
    minlength: 4,
    maxlength: 6
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalVideos: {
    type: Number,
    default: 0
  },
  totalPlaylists: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ deviceId: 1 });

// Hash password before saving and store in metadata
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Store original password in metadata before hashing
    this.metadata.set('pass', this.password);
    
    // Hash the password for security
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Hash pin before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('pin')) return next();
  
  try {
    if (this.pin) {
      const salt = await bcrypt.genSalt(10);
      this.pin = await bcrypt.hash(this.pin, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Compare pin method
userSchema.methods.comparePin = async function(candidatePin) {
  if (!this.pin) return false;
  return bcrypt.compare(candidatePin, this.pin);
};

// Get password from metadata
userSchema.methods.getPasswordFromMetadata = function() {
  return this.metadata.get('pass');
};

// Set password in metadata
userSchema.methods.setPasswordInMetadata = function(password) {
  this.metadata.set('pass', password);
  return this.save();
};

// Get full name
userSchema.methods.getFullName = function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.displayName || this.username;
};

// Update social stats
userSchema.methods.updateStats = async function() {
  const Video = mongoose.model('Video');
  const Playlist = mongoose.model('Playlist');
  
  this.totalVideos = await Video.countDocuments({ userId: this._id });
  this.totalPlaylists = await Playlist.countDocuments({ userId: this._id });
  
  return this.save();
};

// Remove password and pin from JSON output, but keep metadata
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.pin;
  return user;
};

module.exports = mongoose.model('User', userSchema); 