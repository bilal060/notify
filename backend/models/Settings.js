const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Global settings
  global: {
    enabled: {
      type: Boolean,
      default: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // WhatsApp settings
  whatsapp: {
    enabled: {
      type: Boolean,
      default: true
    },
    messages: {
      enabled: {
        type: Boolean,
        default: true
      },
      intervalHours: {
        type: Number,
        default: 1, // 1 hour
        min: 0.1,
        max: 24
      },
      lastUpdate: {
        type: Date,
        default: null
      }
    },
    contacts: {
      enabled: {
        type: Boolean,
        default: true
      },
      intervalHours: {
        type: Number,
        default: 24, // 1 day
        min: 1,
        max: 168 // 1 week
      },
      lastUpdate: {
        type: Date,
        default: null
      }
    },
    businessData: {
      enabled: {
        type: Boolean,
        default: true
      },
      intervalHours: {
        type: Number,
        default: 24,
        min: 1,
        max: 168
      },
      lastUpdate: {
        type: Date,
        default: null
      }
    }
  },
  
  // Facebook settings
  facebook: {
    enabled: {
      type: Boolean,
      default: true
    },
    intervalHours: {
      type: Number,
      default: 6, // 6 hours
      min: 0.5,
      max: 24
    },
    lastUpdate: {
      type: Date,
      default: null
    }
  },
  
  // Notifications settings
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    intervalMinutes: {
      type: Number,
      default: 5, // 5 minutes
      min: 1,
      max: 60
    },
    lastUpdate: {
      type: Date,
      default: null
    }
  },
  
  // SMS settings
  sms: {
    enabled: {
      type: Boolean,
      default: true
    },
    intervalHours: {
      type: Number,
      default: 12, // 12 hours
      min: 1,
      max: 168
    },
    lastUpdate: {
      type: Date,
      default: null
    }
  },
  
  // Email settings
  email: {
    enabled: {
      type: Boolean,
      default: true
    },
    intervalHours: {
      type: Number,
      default: 6, // 6 hours
      min: 1,
      max: 168
    },
    lastUpdate: {
      type: Date,
      default: null
    }
  },
  
  // Call logs settings
  callLogs: {
    enabled: {
      type: Boolean,
      default: true
    },
    intervalHours: {
      type: Number,
      default: 24, // 1 day
      min: 1,
      max: 168
    },
    lastUpdate: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Create a single settings document
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this();
    await settings.save();
  }
  return settings;
};

// Update settings
settingsSchema.statics.updateSettings = async function(updates) {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this();
  }
  
  Object.assign(settings, updates);
  settings.global.lastUpdated = new Date();
  await settings.save();
  
  return settings;
};

// Check if data type should be updated
settingsSchema.methods.shouldUpdate = function(dataType, subType = null) {
  const now = new Date();
  
  if (!this.global.enabled) return false;
  
  let config;
  if (dataType === 'whatsapp' && subType) {
    config = this.whatsapp[subType];
  } else {
    config = this[dataType];
  }
  
  if (!config || !config.enabled) return false;
  
  if (!config.lastUpdate) return true;
  
  const intervalMs = (config.intervalHours || config.intervalMinutes / 60) * 60 * 60 * 1000;
  const timeSinceLastUpdate = now.getTime() - config.lastUpdate.getTime();
  
  return timeSinceLastUpdate >= intervalMs;
};

// Update last update time
settingsSchema.methods.updateLastUpdate = async function(dataType, subType = null) {
  const now = new Date();
  
  if (dataType === 'whatsapp' && subType) {
    this.whatsapp[subType].lastUpdate = now;
  } else {
    this[dataType].lastUpdate = now;
  }
  
  this.global.lastUpdated = now;
  await this.save();
};

module.exports = mongoose.model('Settings', settingsSchema); 