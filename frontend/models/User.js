import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  bio: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  company: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light',
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: 'en',
    },
  },
}, {
  timestamps: true,
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);