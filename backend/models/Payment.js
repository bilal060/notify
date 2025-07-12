const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  subscriptionType: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  stripePaymentIntentId: {
    type: String,
    required: true
  },
  stripeCustomerId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'canceled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'card'
  },
  description: {
    type: String,
    default: 'Notification monitoring subscription'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  refunded: {
    type: Boolean,
    default: false
  },
  refundAmount: {
    type: Number,
    default: 0
  },
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

// Index for better query performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `$${(this.amount / 100).toFixed(2)}`;
});

// Method to mark as succeeded
paymentSchema.methods.markAsSucceeded = function() {
  this.status = 'succeeded';
  this.updatedAt = new Date();
  return this.save();
};

// Method to mark as failed
paymentSchema.methods.markAsFailed = function() {
  this.status = 'failed';
  this.updatedAt = new Date();
  return this.save();
};

// Static method to get user payments
paymentSchema.statics.getUserPayments = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'username email');
};

// Static method to get successful payments
paymentSchema.statics.getSuccessfulPayments = function(userId) {
  return this.find({ 
    user: userId, 
    status: 'succeeded',
    refunded: false 
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Payment', paymentSchema); 