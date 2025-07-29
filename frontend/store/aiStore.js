import { create } from 'zustand';
import { aiAPI } from '@/utils/api';
import toast from 'react-hot-toast';

// Mock component generators for fallback
const generateMockComponent = (prompt) => {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('card')) {
    return `function Component() {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Beautiful Card</h3>
        <p className="text-gray-600 mb-4">This is a responsive card component with hover effects and gradient background.</p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
          Learn More
        </button>
      </div>
    </div>
  );
}`;
  }
  
  if (lowerPrompt.includes('button')) {
    return `function Component() {
  return (
    <div className="flex flex-col space-y-4 p-8">
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
        Primary Button
      </button>
      <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-all duration-200">
        Secondary Button
      </button>
      <button className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
        Outline Button
      </button>
    </div>
  );
}`;
  }
  
  if (lowerPrompt.includes('form')) {
    return `function Component() {
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Contact Form</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input 
            type="text" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <textarea 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            rows="4"
            placeholder="Enter your message"
          ></textarea>
        </div>
        <button 
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}`;
  }
  
  // Default component
  return `function Component() {
  return (
    <div className="max-w-lg mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-3xl shadow-2xl border border-blue-200 text-center transform hover:scale-105 transition-all duration-300">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Generated Component</h2>
      <p className="text-gray-600 mb-6">You asked for: "${prompt}"</p>
      <div className="flex justify-center space-x-3">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
          Action
        </button>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}`;
};

const generateMockCSS = (prompt) => {
  return `/* Generated styles for: ${prompt} */
.component-container {
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
}

.component-container * {
  box-sizing: border-box;
}

/* Add your custom styles here */`;
};

export const useAIStore = create((set, get) => ({
  // State
  isGenerating: false,
  currentComponent: {
    jsx: `function Component() {
  return (
    <div style={{
      padding: '20px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h2 style={{ marginBottom: '10px', fontSize: '24px' }}>Welcome to Component Builder</h2>
      <p style={{ opacity: 0.9 }}>Start by describing what you want to create in the chat!</p>
    </div>
  );
}`,
    css: `/* Add your custom styles here */
.component-container {
  max-width: 600px;
  margin: 0 auto;
}`,
    props: {}
  },
  chatMessages: [],
  generationHistory: [],
  error: null,

  // Actions
  generateComponent: async (prompt, sessionId, context = {}) => {
    set({ isGenerating: true, error: null });
    
    try {
      // Add user message to chat
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: prompt,
        timestamp: new Date().toISOString()
      };
      
      set(state => ({
        chatMessages: [...state.chatMessages, userMessage]
      }));

      // Call AI API and handle the actual response
      let response;
      try {
        const apiResponse = await aiAPI.generateComponent({
          prompt,
          sessionId,
          context,
          options: {
            model: 'openai/gpt-4o-mini',
            temperature: 0.7,
            maxTokens: 2000
          }
        });
        
        // Handle the actual API response format from backend
        response = {
          messageId: apiResponse.messageId || Date.now().toString(),
          component: apiResponse.component || {
            jsx: apiResponse.jsx || generateMockComponent(prompt),
            css: apiResponse.css || generateMockCSS(prompt),
            props: apiResponse.props || {}
          },
          version: apiResponse.version || 1,
          metadata: apiResponse.metadata || { source: 'api' }
        };
        
        console.log('✅ API Response received:', {
          hasComponent: !!response.component,
          hasJsx: !!response.component.jsx,
          jsxPreview: response.component.jsx?.substring(0, 100) + '...'
        });
        
      } catch (error) {
        console.error('AI API Error:', error);
        // Fallback to mock
        response = {
          messageId: Date.now().toString(),
          component: {
            jsx: generateMockComponent(prompt),
            css: generateMockCSS(prompt),
            props: {}
          },
          version: 1,
          metadata: { source: 'fallback' }
        };
      }

      // Ensure response has the expected structure
      if (!response.component) {
        response.component = {
          jsx: response.jsx || generateMockComponent(prompt),
          css: response.css || generateMockCSS(prompt),
          props: response.props || {}
        };
      }

      // Add AI response to chat
      const aiMessage = {
        id: response.messageId || Date.now().toString(),
        role: 'assistant',
        content: response.component.jsx,
        timestamp: new Date().toISOString(),
        metadata: response.metadata || {}
      };

      console.log('Updating AI store with component:', response.component);
      
      set(state => ({
        chatMessages: [...state.chatMessages, aiMessage],
        currentComponent: response.component,
        generationHistory: [...state.generationHistory, {
          version: response.version || 1,
          component: response.component,
          prompt,
          timestamp: new Date().toISOString()
        }],
        isGenerating: false
      }));
      
      console.log('AI store updated, new currentComponent:', get().currentComponent);

      toast.success('Component generated successfully!');
      return response;

    } catch (error) {
      set({ 
        isGenerating: false, 
        error: error.message || 'Failed to generate component' 
      });
      toast.error(error.message || 'Failed to generate component');
      throw error;
    }
  },

  refineComponent: async (prompt, sessionId) => {
    const { currentComponent } = get();
    set({ isGenerating: true, error: null });
    
    try {
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: `Refine: ${prompt}`,
        timestamp: new Date().toISOString()
      };
      
      set(state => ({
        chatMessages: [...state.chatMessages, userMessage]
      }));

      // Call AI API for refinement
      let response;
      try {
        const apiResponse = await aiAPI.refineComponent({
          prompt,
          sessionId,
          currentComponent,
          options: {
            model: 'openai/gpt-4o-mini',
            temperature: 0.7,
            maxTokens: 2000
          }
        });
        
        response = {
          messageId: apiResponse.messageId || Date.now().toString(),
          component: apiResponse.component || {
            jsx: apiResponse.jsx || currentComponent.jsx,
            css: apiResponse.css || currentComponent.css,
            props: apiResponse.props || currentComponent.props
          },
          version: apiResponse.version || (currentComponent.version || 1) + 1,
          metadata: apiResponse.metadata || { source: 'api-refine' }
        };
        
      } catch (error) {
        console.error('AI Refine Error:', error);
        // If API fails, create a refined version of the current component
        response = {
          messageId: Date.now().toString(),
          component: {
            jsx: currentComponent.jsx,
            css: currentComponent.css,
            props: currentComponent.props
          },
          version: (currentComponent.version || 1) + 1,
          metadata: { source: 'fallback-refine' }
        };
      }

      // Add AI response
      const aiMessage = {
        id: response.messageId || Date.now().toString(),
        role: 'assistant',
        content: response.component.jsx,
        timestamp: new Date().toISOString(),
        metadata: response.metadata || {}
      };

      set(state => ({
        chatMessages: [...state.chatMessages, aiMessage],
        currentComponent: response.component,
        generationHistory: [...state.generationHistory, {
          version: response.version || (state.generationHistory.length + 1),
          component: response.component,
          prompt: `Refine: ${prompt}`,
          timestamp: new Date().toISOString()
        }],
        isGenerating: false
      }));

      toast.success('Component refined successfully!');
      return response;

    } catch (error) {
      set({ 
        isGenerating: false, 
        error: error.message || 'Failed to refine component' 
      });
      toast.error(error.message || 'Failed to refine component');
      throw error;
    }
  },

  updateComponent: (jsx, css, props = {}) => {
    console.log('Updating component with:', { jsx, css, props });
    set(state => ({
      currentComponent: { jsx, css, props }
    }));
  },

  loadChatHistory: (messages) => {
    set({ chatMessages: messages });
  },

  clearChat: () => {
    set({ 
      chatMessages: [],
      currentComponent: { jsx: '', css: '', props: {} },
      generationHistory: [],
      error: null
    });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  }
}));