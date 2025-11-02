const jwt = require('jsonwebtoken');
const User = require('../models/User');

// User cache for faster lookups
const userCache = new Map();
const USER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Token cache from auth routes
const getTokenCache = () => {
  // Import token cache from auth routes if available
  try {
    const authRoutes = require('../routes/auth');
    return authRoutes.tokenCache || new Map();
  } catch {
    return new Map();
  }
};

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Check token cache first for faster validation
    const tokenCache = getTokenCache();
    const cachedTokenData = tokenCache.get(token);
    
    let decoded;
    let userId;
    
    if (cachedTokenData && (Date.now() - cachedTokenData.timestamp < 5 * 60 * 1000)) {
      // Use cached token data
      userId = cachedTokenData.userId;
    } else {
      // Verify token
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
      
      // Cache the token
      tokenCache.set(token, {
        userId,
        timestamp: Date.now()
      });
    }

    // Check user cache first
    const cacheKey = `user_${userId}`;
    const cachedUser = userCache.get(cacheKey);
    
    if (cachedUser && (Date.now() - cachedUser.timestamp < USER_CACHE_TTL)) {
      req.user = cachedUser.user;
      return next();
    }

    // Fetch user with lean query for speed
    const user = await User.findById(userId).select('-password').lean();
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    // Cache the user
    userCache.set(cacheKey, {
      user,
      timestamp: Date.now()
    });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    res.status(500).json({ error: 'Server error during authentication.' });
  }
};

// Clean expired users from cache
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of userCache.entries()) {
    if (now - data.timestamp > USER_CACHE_TTL) {
      userCache.delete(key);
    }
  }
}, 2 * 60 * 1000); // Clean every 2 minutes

module.exports = auth;