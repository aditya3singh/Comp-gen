'use client';

import { useState, useRef, useEffect } from 'react';
import { useAIStore } from '@/store/aiStore';
import { Send, Loader2, User, Bot, Image } from 'lucide-react';
import { formatTime } from '@/utils/helpers';

export default function ChatPanel({ sessionId }) {
  const { 
    chatMessages, 
    isGenerating, 
    generateComponent, 
    refineComponent,
    currentComponent,
    error 
  } = useAIStore();
  
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const prompt = input.trim();
    setInput('');

    try {
      if (currentComponent.jsx) {
        // If component exists, refine it
        await refineComponent(prompt, sessionId);
      } else {
        // Generate new component
        await generateComponent(prompt, sessionId, {
          hasImage: !!imageFile
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
    }

    // Clear image after sending
    if (imageFile) {
      setImageFile(null);
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-6 border-b-2 border-black bg-white">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-black text-lg">AI Assistant</h3>
            <p className="text-sm text-gray-600">
              Powered by AI • Fast & Reliable
            </p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
          <p className="text-sm text-gray-700 font-medium">
            💡 Describe the component you want to create
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {chatMessages.length === 0 ? (
          <div className="text-center mt-8">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Ready to Create!</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Start by describing a React component you'd like to create. I'll generate it instantly with modern styling.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-left border-2 border-gray-200">
                <p className="text-sm font-bold text-black mb-3 flex items-center">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  Example prompts:
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    "Create a modern login form with email and password"
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    "Build a product card with image, title, and price"
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    "Make a responsive navigation bar with menu items"
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    "Design a dashboard with charts and statistics"
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-lg transition-all hover:shadow-xl ${
                  message.role === 'user'
                    ? 'bg-red-600 text-white border-2 border-red-600'
                    : 'bg-white border-2 border-gray-200 text-black hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {message.role === 'assistant' && (
                    <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {message.role === 'user' && (
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">{message.content}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className={`text-xs font-medium ${
                        message.role === 'user' ? 'text-red-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                      {message.metadata && (
                        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                          message.role === 'user' 
                            ? 'text-red-100 bg-white/10' 
                            : 'text-gray-600 bg-gray-100'
                        }`}>
                          {message.metadata.model?.split('/')[1] || 'AI'} • {message.metadata.processingTime}ms
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-gray-200 rounded-2xl px-5 py-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                <span className="text-sm text-black font-medium">Generating your component...</span>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-white border-2 border-red-600 rounded-2xl p-5 shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <p className="text-sm font-medium text-black mb-1">Generation Error</p>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-6 border-t-2 border-black bg-white">
        {imageFile && (
          <div className="mb-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Image className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-bold text-black">{imageFile.name}</span>
            </div>
            <button
              onClick={removeImage}
              className="text-gray-400 hover:text-red-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-all font-bold text-lg"
            >
              ×
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-end space-x-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
              title="Upload image"
            >
              <Image className="h-5 w-5" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  currentComponent.jsx 
                    ? "Describe how to modify the component..."
                    : "Describe the component you want to create..."
                }
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-black bg-white transition-all duration-200 placeholder-gray-500 font-medium"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                Enter to send • Shift+Enter for new line
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="p-4 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none flex items-center justify-center min-w-[56px]"
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}