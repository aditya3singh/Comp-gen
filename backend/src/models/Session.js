const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    model: String,
    tokens: Number,
    processingTime: Number
  }
});

const componentVersionSchema = new mongoose.Schema({
  version: {
    type: Number,
    required: true
  },
  jsx: {
    type: String,
    required: true
  },
  css: {
    type: String,
    default: ''
  },
  props: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  messageId: String // Reference to the message that created this version
});

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema],
  currentComponent: {
    jsx: {
      type: String,
      default: ''
    },
    css: {
      type: String,
      default: ''
    },
    props: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  componentHistory: [componentVersionSchema],
  settings: {
    model: {
      type: String,
      default: 'gpt-4o-mini'
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2
    },
    maxTokens: {
      type: Number,
      default: 2000
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Update lastActivity on save
sessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Index for efficient queries
sessionSchema.index({ userId: 1, lastActivity: -1 });
sessionSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Session', sessionSchema);