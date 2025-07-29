'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

// Disable static generation for this page
export const dynamic = 'force-dynamic';
import { useSessionStore } from '@/store/sessionStore';
import { useProjectStore } from '@/store/projectStore';
import { formatDate } from '@/utils/helpers';
import {
  Plus,
  Search,
  Loader2,
  MessageSquare,
  Calendar,
  Tag,
  ChevronRight,
  Sparkles,
  LogOut,
  Settings,
  User,
  Code,
  Zap,
  Grid,
  List,
  BarChart3
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import SettingsModal from '@/components/ui/SettingsModal';
import ProjectAnalytics from '@/components/dashboard/ProjectAnalytics';
import QuickActions from '@/components/dashboard/QuickActions';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { sessions, fetchSessions, createSession, isLoading: sessionsLoading } = useSessionStore();
  const projectStore = useProjectStore();

  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [newSessionData, setNewSessionData] = useState({
    title: '',
    description: '',
    tags: ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated, authLoading, router, fetchSessions]);

  const handleCreateSession = async (e) => {
    e.preventDefault();

    if (!newSessionData.title.trim()) return;

    const tags = newSessionData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const session = await createSession(
      newSessionData.title.trim(),
      newSessionData.description.trim() || undefined,
      tags.length > 0 ? tags : undefined
    );

    if (session) {
      setShowCreateModal(false);
      setNewSessionData({ title: '', description: '', tags: '' });
      router.push(`/workspace/${session._id}`);
    }
  };

  const handleSessionClick = (sessionId) => {
    router.push(`/workspace/${sessionId}`);
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (authLoading) {
    return <Loading variant="page" text="Loading your workspace..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-neutral-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">
                    AI Component Generator
                  </h1>
                  <p className="text-xs text-neutral-500">Build components with AI</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-3 bg-neutral-100/80 rounded-2xl px-4 py-2">
                <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-neutral-700">{user?.name}</span>
              </div>

              <Button
                onClick={() => setShowSettingsModal(true)}
                variant="ghost"
                size="sm"
              >
                <Settings className="h-4 w-4" />
              </Button>

              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-error-600 hover:bg-error-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="card p-8 bg-dot-pattern relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-5"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                    Welcome back, {user?.name}! 👋
                  </h2>
                  <p className="text-neutral-600 text-lg mb-4">
                    Create and manage your React component projects
                  </p>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-sm text-neutral-500">
                      <Code className="h-4 w-4" />
                      <span>{sessions.length} projects</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-neutral-500">
                      <Zap className="h-4 w-4" />
                      <span>AI-powered</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-neutral-500">
                      <Calendar className="h-4 w-4" />
                      <span>Last login: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="w-24 h-24 gradient-primary rounded-3xl opacity-10 animate-pulse-slow"></div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Code className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-neutral-900">{sessions.length}</p>
                      <p className="text-sm text-neutral-500">Projects</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-success-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-neutral-900">
                        {sessions.reduce((acc, session) => acc + (session.componentHistory?.length || 0), 0)}
                      </p>
                      <p className="text-sm text-neutral-500">Components</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-accent-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-neutral-900">
                        {sessions.reduce((acc, session) => acc + (session.messages?.length || 0), 0)}
                      </p>
                      <p className="text-sm text-neutral-500">Messages</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-warning-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-neutral-900">
                        {sessions.filter(s => new Date(s.lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                      </p>
                      <p className="text-sm text-neutral-500">This week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="mb-8">
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-8">
              {[
                { id: 'projects', label: 'Projects', icon: Code },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'quick-actions', label: 'Quick Actions', icon: Zap },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {activeTab === 'projects' && (
          <>
            {/* Actions Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11"
                  />
                </div>

                <div className="flex items-center space-x-1 bg-neutral-100 rounded-xl p-1">
                  <Button
                    onClick={() => setViewMode('grid')}
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode('list')}
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => setShowCreateModal(true)}
                size="lg"
                className="interactive"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Project
              </Button>
            </div>

            {/* Projects Grid/List */}
            {sessionsLoading ? (
              <Loading variant="card" text="Loading your projects..." />
            ) : filteredSessions.length === 0 ? (
              <EmptyState
                title={searchQuery ? 'No projects found' : 'No projects yet'}
                description={searchQuery
                  ? 'Try adjusting your search terms or create a new project'
                  : 'Create your first AI component project to get started'
                }
                action={!searchQuery}
                actionLabel="Create Your First Project"
                onAction={() => setShowCreateModal(true)}
              />
            ) : (
              <div className={viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
              }>
                {filteredSessions.map((session) => (
                  <div
                    key={session._id}
                    onClick={() => handleSessionClick(session._id)}
                    className={`card card-hover cursor-pointer group ${viewMode === 'list' ? 'p-6 flex items-center space-x-6' : 'p-6'
                      }`}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors mb-2">
                              {session.title}
                            </h3>
                            {session.description && (
                              <p className="text-neutral-600 text-sm line-clamp-2 mb-3">
                                {session.description}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-600 transition-all transform group-hover:translate-x-1" />
                        </div>

                        <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{session.messages?.length || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Code className="h-4 w-4" />
                              <span>{session.componentHistory?.length || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(session.lastActivity)}</span>
                          </div>
                        </div>

                        {session.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {session.tags.slice(0, 3).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="primary"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {session.tags.length > 3 && (
                              <span className="text-xs text-neutral-500 px-2 py-1">
                                +{session.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors mb-1">
                            {session.title}
                          </h3>
                          {session.description && (
                            <p className="text-neutral-600 text-sm mb-2 line-clamp-1">
                              {session.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-neutral-500">
                            <span>{session.messages?.length || 0} messages</span>
                            <span>{session.componentHistory?.length || 0} components</span>
                            <span>{formatDate(session.lastActivity)}</span>
                          </div>
                          {session.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {session.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {session.tags.length > 2 && (
                                <span className="text-xs text-neutral-400">+{session.tags.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-600 transition-all transform group-hover:translate-x-1" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'analytics' && (
          <ErrorBoundary fallbackMessage="Failed to load analytics. Please try again.">
            <ProjectAnalytics />
          </ErrorBoundary>
        )}

        {activeTab === 'quick-actions' && (
          <ErrorBoundary fallbackMessage="Failed to load quick actions. Please try again.">
            <QuickActions onCreateProject={() => setShowCreateModal(true)} />
          </ErrorBoundary>
        )}
      </main>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card max-w-md w-full p-8 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 gradient-primary rounded-3xl flex items-center justify-center mb-4 mx-auto shadow-glow">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Create New Project</h3>
              <p className="text-neutral-600">Start building your next amazing component</p>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Project Title *
                </label>
                <Input
                  type="text"
                  value={newSessionData.title}
                  onChange={(e) => setNewSessionData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Login Form Component"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={newSessionData.description}
                  onChange={(e) => setNewSessionData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what you want to build..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Tags
                </label>
                <Input
                  type="text"
                  value={newSessionData.tags}
                  onChange={(e) => setNewSessionData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="form, ui, react (comma separated)"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  variant="secondary"
                  size="lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="interactive"
                >
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}