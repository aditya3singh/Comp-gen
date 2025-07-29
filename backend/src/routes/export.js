const express = require('express');
const archiver = require('archiver');
const { body, validationResult } = require('express-validator');
const Session = require('../models/Session');
const auth = require('../middleware/auth');

const router = express.Router();

// Export component as ZIP
router.post('/zip', auth, [
  body('sessionId').isMongoId(),
  body('format').optional().isIn(['jsx', 'tsx']),
  body('includeHistory').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { sessionId, format = 'jsx', includeHistory = false } = req.body;

    // Get session
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.currentComponent.jsx) {
      return res.status(400).json({ error: 'No component to export' });
    }

    // Set response headers
    const filename = `${session.title.replace(/[^a-zA-Z0-9]/g, '_')}_component.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Create archive
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).json({ error: 'Failed to create archive' });
    });

    archive.pipe(res);

    // Add main component file
    const componentName = session.title.replace(/[^a-zA-Z0-9]/g, '') || 'Component';
    const fileExtension = format === 'tsx' ? 'tsx' : 'jsx';
    
    const componentCode = generateComponentFile(
      session.currentComponent, 
      componentName, 
      format === 'tsx'
    );
    
    archive.append(componentCode, { name: `${componentName}.${fileExtension}` });

    // Add CSS file if exists
    if (session.currentComponent.css) {
      archive.append(session.currentComponent.css, { name: `${componentName}.css` });
    }

    // Add package.json
    const packageJson = generatePackageJson(componentName, format === 'tsx');
    archive.append(packageJson, { name: 'package.json' });

    // Add README
    const readme = generateReadme(session, componentName);
    archive.append(readme, { name: 'README.md' });

    // Add history if requested
    if (includeHistory && session.componentHistory.length > 0) {
      const historyData = JSON.stringify(session.componentHistory, null, 2);
      archive.append(historyData, { name: 'component-history.json' });
    }

    // Add chat history
    const chatHistory = generateChatHistory(session);
    archive.append(chatHistory, { name: 'chat-history.md' });

    // Finalize archive
    archive.finalize();

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export component' });
  }
});

// Get component code as text
router.get('/code/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { format = 'jsx' } = req.query;

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.currentComponent.jsx) {
      return res.status(400).json({ error: 'No component code available' });
    }

    const componentName = session.title.replace(/[^a-zA-Z0-9]/g, '') || 'Component';
    const componentCode = generateComponentFile(
      session.currentComponent, 
      componentName, 
      format === 'tsx'
    );

    res.json({
      component: {
        name: componentName,
        jsx: componentCode,
        css: session.currentComponent.css || '',
        format
      }
    });

  } catch (error) {
    console.error('Get code error:', error);
    res.status(500).json({ error: 'Failed to get component code' });
  }
});

// Helper functions
function generateComponentFile(component, componentName, isTypeScript) {
  const imports = isTypeScript 
    ? `import React from 'react';\nimport './${componentName}.css';\n\n`
    : `import React from 'react';\nimport './${componentName}.css';\n\n`;

  const typeAnnotations = isTypeScript ? ': React.FC' : '';
  
  let componentCode = component.jsx;
  
  // Ensure component is properly named and exported
  if (!componentCode.includes(`function ${componentName}`) && 
      !componentCode.includes(`const ${componentName}`)) {
    // Wrap in named function if not already
    componentCode = `function ${componentName}()${typeAnnotations} {\n  return (\n    ${componentCode}\n  );\n}`;
  }

  // Add export if not present
  if (!componentCode.includes('export')) {
    componentCode += `\n\nexport default ${componentName};`;
  }

  return imports + componentCode;
}

function generatePackageJson(componentName, isTypeScript) {
  const dependencies = {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  };

  const devDependencies = isTypeScript ? {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  } : {};

  return JSON.stringify({
    name: componentName.toLowerCase(),
    version: "1.0.0",
    description: `Generated React component: ${componentName}`,
    main: isTypeScript ? `${componentName}.tsx` : `${componentName}.jsx`,
    dependencies,
    devDependencies,
    peerDependencies: {
      "react": ">=16.8.0",
      "react-dom": ">=16.8.0"
    },
    keywords: ["react", "component", "ai-generated"],
    author: "AI Component Generator",
    license: "MIT"
  }, null, 2);
}

function generateReadme(session, componentName) {
  return `# ${componentName}

Generated by AI Component Generator

## Description
${session.description || 'AI-generated React component'}

## Usage

\`\`\`jsx
import ${componentName} from './${componentName}';

function App() {
  return (
    <div>
      <${componentName} />
    </div>
  );
}
\`\`\`

## Component Details

- **Created**: ${session.createdAt.toISOString()}
- **Last Modified**: ${session.lastActivity.toISOString()}
- **Version**: ${session.componentHistory.length}
- **Messages**: ${session.messages.length}

## Installation

\`\`\`bash
npm install react react-dom
\`\`\`

## Files Included

- \`${componentName}.jsx\` - Main component file
- \`${componentName}.css\` - Component styles
- \`package.json\` - Package configuration
- \`chat-history.md\` - Conversation history
- \`component-history.json\` - Version history (if included)

---

Generated on ${new Date().toISOString()}
`;
}

function generateChatHistory(session) {
  let markdown = `# Chat History\n\n`;
  markdown += `**Session**: ${session.title}\n`;
  markdown += `**Created**: ${session.createdAt.toISOString()}\n`;
  markdown += `**Messages**: ${session.messages.length}\n\n`;
  markdown += `---\n\n`;

  session.messages.forEach((message, index) => {
    const timestamp = new Date(message.timestamp).toLocaleString();
    const role = message.role === 'user' ? '👤 User' : '🤖 Assistant';
    
    markdown += `## ${role} - ${timestamp}\n\n`;
    markdown += `${message.content}\n\n`;
    
    if (message.metadata) {
      markdown += `*Metadata: ${JSON.stringify(message.metadata, null, 2)}*\n\n`;
    }
    
    markdown += `---\n\n`;
  });

  return markdown;
}

module.exports = router;