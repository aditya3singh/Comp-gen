const express = require('express');
const { body, validationResult } = require('express-validator');
const AIService = require('../services/aiService');
const Session = require('../models/Session');
const auth = require('../middleware/auth');

const router = express.Router();
const aiService = new AIService();

// Generate component from prompt
router.post('/generate', auth, [
  body('prompt').isLength({ min: 1, max: 2000 }),
  body('sessionId').isMongoId(),
  body('context').optional().isObject(),
  body('options').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { prompt, sessionId, context = {}, options = {} } = req.body;

    // Verify session ownership
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Build context for AI
    const aiContext = buildAIContext(prompt, context, session);
    
    // Generate response
    const startTime = Date.now();
    const response = await aiService.generateComponent(aiContext, {
      model: options.model || session.settings.model,
      temperature: options.temperature || session.settings.temperature,
      maxTokens: options.maxTokens || session.settings.maxTokens
    });

    const processingTime = Date.now() - startTime;

    // Parse the response to extract JSX and CSS
    const parsedComponent = parseAIResponse(response);

    // Add user message to session
    const userMessageId = `msg_${Date.now()}_user`;
    session.messages.push({
      id: userMessageId,
      role: 'user',
      content: prompt,
      timestamp: new Date()
    });

    // Add AI response to session
    const aiMessageId = `msg_${Date.now()}_ai`;
    session.messages.push({
      id: aiMessageId,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      metadata: {
        model: options.model || session.settings.model,
        processingTime,
        tokens: estimateTokens(response)
      }
    });

    // Update current component
    session.currentComponent = {
      jsx: parsedComponent.jsx,
      css: parsedComponent.css,
      props: parsedComponent.props || {}
    };

    // Add to component history
    const version = session.componentHistory.length + 1;
    session.componentHistory.push({
      version,
      jsx: parsedComponent.jsx,
      css: parsedComponent.css,
      props: parsedComponent.props || {},
      messageId: aiMessageId,
      createdAt: new Date()
    });

    await session.save();

    res.json({
      message: 'Component generated successfully',
      component: parsedComponent,
      messageId: aiMessageId,
      version,
      metadata: {
        processingTime,
        model: options.model || session.settings.model
      }
    });

  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate component',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Refine existing component
router.post('/refine', auth, [
  body('prompt').isLength({ min: 1, max: 2000 }),
  body('sessionId').isMongoId(),
  body('currentComponent').isObject(),
  body('options').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { prompt, sessionId, currentComponent, options = {} } = req.body;

    // Verify session ownership
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Build refinement context
    const refinementContext = buildRefinementContext(prompt, currentComponent, session);
    
    // Generate refined component
    const startTime = Date.now();
    const response = await aiService.refineComponent(refinementContext, {
      model: options.model || session.settings.model,
      temperature: options.temperature || session.settings.temperature,
      maxTokens: options.maxTokens || session.settings.maxTokens
    });

    const processingTime = Date.now() - startTime;

    // Parse the refined response
    const refinedComponent = parseAIResponse(response);

    // Add messages to session
    const userMessageId = `msg_${Date.now()}_user`;
    session.messages.push({
      id: userMessageId,
      role: 'user',
      content: `Refine: ${prompt}`,
      timestamp: new Date()
    });

    const aiMessageId = `msg_${Date.now()}_ai`;
    session.messages.push({
      id: aiMessageId,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      metadata: {
        model: options.model || session.settings.model,
        processingTime,
        tokens: estimateTokens(response),
        type: 'refinement'
      }
    });

    // Update current component
    session.currentComponent = {
      jsx: refinedComponent.jsx,
      css: refinedComponent.css,
      props: refinedComponent.props || {}
    };

    // Add to component history
    const version = session.componentHistory.length + 1;
    session.componentHistory.push({
      version,
      jsx: refinedComponent.jsx,
      css: refinedComponent.css,
      props: refinedComponent.props || {},
      messageId: aiMessageId,
      createdAt: new Date()
    });

    await session.save();

    res.json({
      message: 'Component refined successfully',
      component: refinedComponent,
      messageId: aiMessageId,
      version,
      metadata: {
        processingTime,
        model: options.model || session.settings.model
      }
    });

  } catch (error) {
    console.error('AI refinement error:', error);
    res.status(500).json({ 
      error: 'Failed to refine component',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper functions
function buildAIContext(prompt, context, session) {
  const systemPrompt = `You are an expert React component generator. Generate clean, modern React components based on user prompts.

CRITICAL: Always return your response in this EXACT format:

\`\`\`jsx
function ComponentName() {
  return (
    <div className="your-tailwind-classes">
      {/* Your JSX here */}
    </div>
  );
}
\`\`\`

\`\`\`css
/* Any additional custom CSS here */
.custom-class {
  /* styles */
}
\`\`\`

Rules:
1. Always return valid JSX code wrapped in \`\`\`jsx blocks
2. Use modern React functional components with hooks
3. Use Tailwind CSS classes for styling
4. Make components responsive and accessible
5. Include custom CSS in separate \`\`\`css block if needed
6. Component name should be descriptive (Button, Card, LoginForm, etc.)

User preferences:
- Theme: ${context.theme || 'light'}
- Framework: React with JSX
- Styling: Tailwind CSS + Custom CSS

Previous context: ${session.messages.slice(-2).map(m => `${m.role}: ${m.content.substring(0, 100)}`).join('\n')}`;

  return {
    system: systemPrompt,
    user: prompt
  };
}

function buildRefinementContext(prompt, currentComponent, session) {
  const systemPrompt = `You are refining an existing React component. Make the requested changes while preserving the component's core functionality.

Current component:
\`\`\`jsx
${currentComponent.jsx}
\`\`\`

\`\`\`css
${currentComponent.css}
\`\`\`

Rules:
1. Only modify what's requested
2. Maintain existing functionality
3. Keep the same component structure unless explicitly asked to change it
4. Return the complete updated component code
5. Use the same format as the original

Recent conversation: ${session.messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}`;

  return {
    system: systemPrompt,
    user: `Please refine the component: ${prompt}`
  };
}

function parseAIResponse(response) {
  console.log('Parsing AI response:', response.substring(0, 200) + '...');
  
  // Extract JSX/TSX code
  const jsxMatch = response.match(/```(?:jsx|tsx|javascript|typescript|js|ts)\n([\s\S]*?)\n```/);
  
  // Extract CSS code
  const cssMatch = response.match(/```css\n([\s\S]*?)\n```/);
  
  let jsx = '';
  let css = '';
  
  if (jsxMatch) {
    jsx = jsxMatch[1].trim();
    console.log('Found JSX in code block:', jsx.substring(0, 100) + '...');
  } else {
    // If no code blocks found, try to extract JSX from the response
    jsx = response.trim();
  }
  
  if (cssMatch) {
    css = cssMatch[1].trim();
  }
  
  // If no JSX was extracted and response contains both JSX and CSS patterns
  if (!jsx && response.includes('function ') && response.includes('return')) {
    jsx = response.trim();
  }
  
  return {
    jsx: jsx || 'function Component() { return <div>No component generated</div>; }',
    css: css || '/* No styles generated */',
    props: {} // Could be enhanced to extract props from JSX
  };
}

function estimateTokens(text) {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

module.exports = router;