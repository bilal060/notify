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
  uniqueId: {
    type: String,
    unique: true,
    default: () => uuidv4()
  },
  uniqueUrl: {
    type: String,
    unique: true,
    default: function() {
      return `${process.env.FRONTEND_URL || 'http://localhost:3000'}/monitor/${this.uniqueId}`;
    }
  },
  subscription: {
    type: {
      type: String,
      enum: ['monthly', 'yearly', 'none'],
      default: 'none'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate unique URL
userSchema.methods.generateUniqueUrl = function() {
  this.uniqueUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/monitor/${this.uniqueId}`;
  return this.uniqueUrl;
};

// Check if subscription is active
userSchema.methods.isSubscriptionActive = function() {
  if (!this.subscription.isActive) return false;
  if (!this.subscription.endDate) return false;
  return new Date() < this.subscription.endDate;
};

// Get user without sensitive data
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema); 