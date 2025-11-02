'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSessionStore } from '@/store/sessionStore';
import { useAIStore } from '@/store/aiStore';
import ChatPanel from '@/components/workspace/ChatPanel';
import ComponentPreview from '@/components/workspace/ComponentPreview';
import CodeEditor from '@/components/workspace/CodeEditor';
import { ArrowLeft, Save, Download, Copy, Settings, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

export default function WorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId;
  
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { currentSession, loadSession, isLoading } = useSessionStore();
  const { currentComponent, chatMessages, loadChatHistory, clearChat, updateComponent } = useAIStore();
  
  const [activeTab, setActiveTab] = useState('jsx');
  const [isSaving, setIsSaving] = useState(false);

  // Debug log for currentComponent changes
  useEffect(() => {
    console.log('🏠 Workspace currentComponent changed:', {
      hasJsx: !!currentComponent.jsx,
      jsxLength: currentComponent.jsx?.length,
      hasCss: !!currentComponent.css,
      cssLength: currentComponent.css?.length
    });
  }, [currentComponent]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated && sessionId) {
      loadSession(sessionId);
    }
  }, [isAuthenticated, authLoading, sessionId, router, loadSession]);

  useEffect(() => {
    if (currentSession) {
      // Load chat history into AI store
      loadChatHistory(currentSession.messages);
    }
  }, [currentSession, loadChatHistory]);

  const handleSave = async () => {
    if (!currentSession || !currentComponent.jsx) return;
    
    setIsSaving(true);
    try {
      // Auto-save functionality would go here
      toast.success('Session saved!');
    } catch (error) {
      toast.error('Failed to save session');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = () => {
    const code = activeTab === 'jsx' ? currentComponent.jsx : currentComponent.css;
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const handleDownload = () => {
    // Download functionality would integrate with export API
    toast.success('Download started!');
  };

  if (authLoading || isLoading) {
    return <Loading variant="page" text="Loading workspace..." />;
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-subtle">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Session not found</h2>
          <p className="text-neutral-600 mb-6">The session you're looking for doesn't exist.</p>
          <Button
            onClick={() => router.push('/dashboard')}
            size="lg"
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Enhanced Header */}
      <header className="bg-white border-b-2 border-black px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">
                  {currentSession.title}
                </h1>
                {currentSession.description && (
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {currentSession.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                isSaving 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black'
              }`}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            
            <button
              onClick={handleCopyCode}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black rounded-lg font-medium transition-all"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-all shadow-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="w-80 bg-white border-r-2 border-black flex flex-col min-w-0 max-w-80">
          <ChatPanel sessionId={sessionId} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Component Preview */}
          <div className="flex-1 min-h-0">
            <ComponentPreview 
              key={`preview-${currentComponent.jsx?.length || 0}-${Date.now()}`}
              jsx={currentComponent.jsx}
              css={currentComponent.css}
              onCodeUpdate={(updatedJsx, updatedCss) => {
                console.log('🔧 Component updated from preview:', { updatedJsx: updatedJsx?.substring(0, 100), updatedCss });
                updateComponent(updatedJsx, updatedCss);
              }}
            />
          </div>

          {/* Code Editor Section */}
          <div className="h-80 bg-white border-t-2 border-black flex flex-col">
            <div className="flex border-b-2 border-black bg-gray-50">
              <button
                onClick={() => setActiveTab('jsx')}
                className={`px-6 py-3 text-sm font-bold transition-all duration-200 ${
                  activeTab === 'jsx'
                    ? 'text-white bg-red-600 border-b-2 border-red-600'
                    : 'text-gray-600 hover:text-black hover:bg-white'
                }`}
              >
                JSX Component
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`px-6 py-3 text-sm font-bold transition-all duration-200 ${
                  activeTab === 'css'
                    ? 'text-white bg-red-600 border-b-2 border-red-600'
                    : 'text-gray-600 hover:text-black hover:bg-white'
                }`}
              >
                CSS Styles
              </button>
              <div className="flex-1 bg-gray-50"></div>
              <div className="flex items-center px-6 text-sm font-medium">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  currentComponent.jsx 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {currentComponent.jsx 
                    ? `${currentComponent.jsx.split('\n').length} lines` 
                    : 'No code generated'
                  }
                </span>
              </div>
            </div>
            
            <div className="flex-1 min-h-0">
              <CodeEditor
                code={activeTab === 'jsx' ? currentComponent.jsx : currentComponent.css}
                language={activeTab === 'jsx' ? 'javascript' : 'css'}
                onChange={(code) => {
                  if (activeTab === 'jsx') {
                    updateComponent(code, currentComponent.css);
                  } else {
                    updateComponent(currentComponent.jsx, code);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}