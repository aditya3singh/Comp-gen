const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Token cache for faster validation
const tokenCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Generate JWT token with caching
const generateToken = (userId) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  
  // Cache token for faster validation
  tokenCache.set(token, {
    userId,
    timestamp: Date.now()
  });
  
  return token;
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Clean expired tokens from cache
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of tokenCache.entries()) {
    if (now - data.timestamp > CACHE_TTL) {
      tokenCache.delete(token);
    }
  }
}, 60000); // Clean every minute

// Register - Optimized for speed
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password, name } = req.body;

    // Check if user exists with lean query for speed
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create user (password will be hashed by pre-save hook)
    const userData = {
      email,
      password, // Let the pre-save hook handle hashing
      name,
      preferences: {
        theme: 'light',
        defaultModel: 'gpt-4o-mini'
      },
      lastLogin: new Date()
    };

    const user = await User.create(userData);

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login - Optimized for speed
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password, rememberMe = false } = req.body;

    // Find user with minimal fields for faster query
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password using bcrypt directly for speed
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update last login asynchronously (don't wait)
    setImmediate(async () => {
      try {
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
      } catch (updateError) {
        console.log('Last login update failed:', updateError.message);
      }
    });

    // Return response immediately
    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferences: user.preferences || {
          theme: 'light',
          defaultModel: 'gpt-4o-mini'
        },
        lastLogin: new Date()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new access token
    const newToken = generateToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Get current user - Optimized with caching
router.get('/me', auth, async (req, res) => {
  try {
    // User is already loaded in auth middleware, just return it
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        preferences: req.user.preferences || {
          theme: 'light',
          defaultModel: 'gpt-4o-mini'
        },
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user preferences
router.patch('/preferences', auth, [
  body('theme').optional().isIn(['light', 'dark']),
  body('defaultModel').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const updates = req.body;
    const user = await User.findById(req.user._id);
    
    Object.keys(updates).forEach(key => {
      if (user.preferences[key] !== undefined) {
        user.preferences[key] = updates[key];
      }
    });

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;