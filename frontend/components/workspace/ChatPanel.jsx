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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-bold text-gray-900">AI Assistant</h3>
        </div>
        <p className="text-sm text-gray-600">
          Describe the component you want to create
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {chatMessages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8 px-4">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8 mb-6">
              <Bot className="h-16 w-16 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to AI Component Generator!</h3>
              <p className="text-sm text-gray-600 mb-4">Start by describing a React component you'd like to create.</p>
              <div className="bg-white rounded-lg p-3 text-left">
                <p className="text-xs font-medium text-gray-700 mb-1">Example prompts:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• "Create a login form with email and password"</li>
                  <li>• "Build a product card with image and price"</li>
                  <li>• "Make a navigation bar with menu items"</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {message.role === 'assistant' && (
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {message.role === 'user' && (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-xs ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                      {message.metadata && (
                        <p className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                          {message.metadata.model?.split('/')[1] || 'AI'} • {message.metadata.processingTime}ms
                        </p>
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
            <div className="bg-gray-100 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4" />
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">Generating component...</span>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t bg-gray-50/50">
        {imageFile && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Image className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-800">{imageFile.name}</span>
            </div>
            <button
              onClick={removeImage}
              className="text-blue-400 hover:text-blue-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-blue-100 transition-colors"
            >
              ×
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-3">
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
              className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-gray-200 hover:border-blue-300"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 bg-white transition-all duration-200 placeholder-gray-500"
                rows={3}
                style={{
                  color: '#111827',
                  backgroundColor: '#ffffff'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center min-w-[48px]"
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