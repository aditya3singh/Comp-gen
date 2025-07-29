const express = require('express');
const { body, validationResult } = require('express-validator');
const Session = require('../models/Session');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all sessions for user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = { 
      userId: req.user._id,
      isActive: true
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sessions = await Session.find(query)
      .select('title description lastActivity tags createdAt')
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Session.countDocuments(query);

    res.json({
      sessions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: sessions.length,
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific session
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new session
router.post('/', auth, [
  body('title').trim().isLength({ min: 1, max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { title, description, tags = [] } = req.body;

    const session = new Session({
      title,
      description,
      userId: req.user._id,
      tags: tags.filter(tag => tag.trim().length > 0)
    });

    await session.save();

    res.status(201).json({
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update session
router.patch('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('tags').optional().isArray(),
  body('currentComponent').optional().isObject(),
  body('settings').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (key === 'tags' && Array.isArray(updates[key])) {
        session[key] = updates[key].filter(tag => tag.trim().length > 0);
      } else if (key === 'currentComponent' || key === 'settings') {
        session[key] = { ...session[key], ...updates[key] };
      } else {
        session[key] = updates[key];
      }
    });

    await session.save();

    res.json({
      message: 'Session updated successfully',
      session
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add message to session
router.post('/:id/messages', auth, [
  body('role').isIn(['user', 'assistant']),
  body('content').isLength({ min: 1 }),
  body('metadata').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { role, content, metadata = {} } = req.body;
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const message = {
      id: messageId,
      role,
      content,
      metadata,
      timestamp: new Date()
    };

    session.messages.push(message);
    await session.save();

    res.status(201).json({
      message: 'Message added successfully',
      messageId,
      session: {
        id: session._id,
        messages: session.messages
      }
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save component version
router.post('/:id/components', auth, [
  body('jsx').isLength({ min: 1 }),
  body('css').optional().isString(),
  body('props').optional().isObject(),
  body('messageId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { jsx, css = '', props = {}, messageId } = req.body;

    // Update current component
    session.currentComponent = { jsx, css, props };

    // Add to history
    const version = session.componentHistory.length + 1;
    session.componentHistory.push({
      version,
      jsx,
      css,
      props,
      messageId,
      createdAt: new Date()
    });

    await session.save();

    res.status(201).json({
      message: 'Component saved successfully',
      version,
      component: session.currentComponent
    });
  } catch (error) {
    console.error('Save component error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete session (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.isActive = false;
    await session.save();

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;