const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  deviceInfo: {
    manufacturer: String,
    model: String,
    androidVersion: String,
    sdkVersion: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  installedApps: [{
    packageName: String,
    appName: String,
    versionName: String,
    versionCode: String,
    installDate: Date
  }],
  lastAppsUpdate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
deviceSchema.index({ deviceId: 1 });
deviceSchema.index({ 'deviceInfo.lastUpdated': -1 });
deviceSchema.index({ isActive: 1 });

// Static method to get device stats
deviceSchema.statics.getDeviceStats = function(deviceId) {
  return this.findOne({ deviceId })
    .select('deviceInfo installedApps lastAppsUpdate createdAt');
};

// Static method to get all active devices
deviceSchema.statics.getActiveDevices = function() {
  return this.find({ isActive: true })
    .select('deviceId deviceInfo lastAppsUpdate createdAt')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Device', deviceSchema); 