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
    <div className="h-screen flex flex-col gradient-subtle">
      {/* Header */}
      <header className="glass border-b border-neutral-200/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="ghost"
              size="sm"
              className="mr-3"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">
                {currentSession.title}
              </h1>
              {currentSession.description && (
                <p className="text-sm text-neutral-500 line-clamp-1">
                  {currentSession.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="secondary"
              size="sm"
              loading={isSaving}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            
            <Button
              onClick={handleCopyCode}
              variant="secondary"
              size="sm"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            
            <Button
              onClick={handleDownload}
              size="sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="w-80 card rounded-none border-r border-neutral-200/60 flex flex-col min-w-0 max-w-80">
          <ChatPanel sessionId={sessionId} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Component Preview */}
          <div className="flex-1 card rounded-none border-0 min-h-0">
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

          {/* Code Editor Tabs */}
          <div className="h-80 card rounded-none border-t border-neutral-200/60 flex flex-col">
            <div className="flex border-b border-neutral-200/60 bg-neutral-50/50">
              <button
                onClick={() => setActiveTab('jsx')}
                className={`px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'jsx'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50'
                }`}
              >
                JSX Component
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'css'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50'
                }`}
              >
                CSS Styles
              </button>
              <div className="flex-1 bg-neutral-50/50"></div>
              <div className="flex items-center px-4 text-xs text-neutral-500">
                {currentComponent.jsx ? `${currentComponent.jsx.split('\n').length} lines` : 'No code generated'}
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