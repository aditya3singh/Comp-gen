const axios = require('axios');

class AIService {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
        this.defaultModel = process.env.AI_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
        this.enableFallback = process.env.ENABLE_AI_FALLBACK === 'true';
    }

    async generateResponse(prompt, options = {}) {
        try {
            const response = await axios.post(`${this.baseURL}/chat/completions`, {
                model: options.model || this.defaultModel,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: options.maxTokens || 1000,
                temperature: options.temperature || 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('AI Service Error:', error.response?.data || error.message);
            throw new Error('Failed to generate AI response');
        }
    }

    async generateComponent(context, options = {}) {
        // Use fallback if enabled and no API key
        if (this.enableFallback && !this.apiKey) {
            return this.generateFallbackComponent(context.user);
        }

        try {
            const messages = [
                {
                    role: 'system',
                    content: context.system
                },
                {
                    role: 'user',
                    content: context.user
                }
            ];

            const response = await axios.post(`${this.baseURL}/chat/completions`, {
                model: options.model || this.defaultModel,
                messages,
                max_tokens: options.maxTokens || 2000,
                temperature: options.temperature || 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('AI Component Generation Error:', error.response?.data || error.message);
            
            // Use fallback on API error if enabled
            if (this.enableFallback) {
                console.log('Using fallback component generation...');
                return this.generateFallbackComponent(context.user);
            }
            
            throw new Error('Failed to generate component');
        }
    }

    async refineComponent(context, options = {}) {
        // Use fallback if enabled and no API key
        if (this.enableFallback && !this.apiKey) {
            return this.generateFallbackComponent(context.user);
        }

        try {
            const messages = [
                {
                    role: 'system',
                    content: context.system
                },
                {
                    role: 'user',
                    content: context.user
                }
            ];

            const response = await axios.post(`${this.baseURL}/chat/completions`, {
                model: options.model || this.defaultModel,
                messages,
                max_tokens: options.maxTokens || 2000,
                temperature: options.temperature || 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('AI Component Refinement Error:', error.response?.data || error.message);
            
            // Use fallback on API error if enabled
            if (this.enableFallback) {
                console.log('Using fallback component refinement...');
                return this.generateFallbackComponent(context.user);
            }
            
            throw new Error('Failed to refine component');
        }
    }

    // Fallback component generation for testing/demo purposes
    generateFallbackComponent(prompt) {
        const lowerPrompt = prompt.toLowerCase();
        
        // Button component
        if (lowerPrompt.includes('button')) {
            return `\`\`\`jsx
function Button() {
  return (
    <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
      Click Me
    </button>
  );
}
\`\`\`

\`\`\`css
/* Button hover effects */
.btn-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
}
\`\`\``;
        }
        
        // Card component
        if (lowerPrompt.includes('card')) {
            return `\`\`\`jsx
function Card() {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-48 flex items-center justify-center">
        <div className="text-white text-6xl">🎨</div>
      </div>
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Beautiful Card</h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          This is a stunning card component with gradient background and smooth animations.
        </p>
        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
          Learn More
        </button>
      </div>
    </div>
  );
}
\`\`\`

\`\`\`css
/* Card animations */
.card-hover:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}
\`\`\``;
        }
        
        // Form component
        if (lowerPrompt.includes('form') || lowerPrompt.includes('login')) {
            return `\`\`\`jsx
function LoginForm() {
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl">🔐</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>
      
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <input 
            type="email" 
            placeholder="Enter your email"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input 
            type="password" 
            placeholder="Enter your password"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Sign In
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Forgot your password?
        </a>
      </div>
    </div>
  );
}
\`\`\`

\`\`\`css
/* Form focus effects */
.form-input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}
\`\`\``;
        }
        
        // Navigation component
        if (lowerPrompt.includes('nav') || lowerPrompt.includes('header')) {
            return `\`\`\`jsx
function Navigation() {
  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Brand
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group">
              Services
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
            </a>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
              Get Started
            </button>
          </div>
          
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
\`\`\`

\`\`\`css
/* Navigation animations */
.nav-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -4px;
  left: 0;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}
\`\`\``;
        }
        
        // Default component
        return `\`\`\`jsx
function Component() {
  return (
    <div className="max-w-lg mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-3xl shadow-2xl border border-blue-200 text-center transform hover:scale-105 transition-all duration-300">
      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        ✨ AI Generated Component
      </h2>
      
      <p className="text-gray-600 mb-6 leading-relaxed">
        Created from your prompt: <span className="font-semibold text-blue-600">"{prompt.substring(0, 40)}${prompt.length > 40 ? '...' : ''}"</span>
      </p>
      
      <div className="space-y-3">
        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          🚀 Get Started
        </button>
        <button className="w-full bg-white text-gray-700 py-3 px-8 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-200">
          Learn More
        </button>
      </div>
      
      <div className="mt-6 flex justify-center space-x-4 text-sm text-gray-500">
        <span className="flex items-center">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
          Responsive
        </span>
        <span className="flex items-center">
          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
          Modern
        </span>
        <span className="flex items-center">
          <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
          Accessible
        </span>
      </div>
    </div>
  );
}
\`\`\`

\`\`\`css
/* Component animations */
.component-glow {
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
\`\`\``;
    }
}

module.exports = AIService;