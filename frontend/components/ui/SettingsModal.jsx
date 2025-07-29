import { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Settings, 
  Palette, 
  Bell, 
  Shield, 
  Users, 
  Zap, 
  Eye, 
  Save,
  Download,
  Upload,
  RotateCcw,
  Moon,
  Sun,
  Monitor,
  Check
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import Button from './Button';
import { Input, Textarea } from './Input';
import Badge from './Badge';
import { Card } from './Card';

const SettingsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, updateProfile } = useAuthStore();
  const {
    theme,
    setTheme,
    editor,
    updateEditorSettings,
    notifications,
    updateNotificationSettings,
    privacy,
    updatePrivacySettings,
    accessibility,
    updateAccessibilitySettings,
    resetToDefaults,
    exportSettings,
    importSettings,
  } = useSettingsStore();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    website: user?.website || '',
    location: user?.location || '',
    company: user?.company || '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        website: user.website || '',
        location: user.location || '',
        company: user.company || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    const success = await updateProfile(profileData);
    setIsLoading(false);
    if (success) {
      // Profile updated successfully
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      importSettings(file);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'editor', label: 'Editor', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'advanced', label: 'Advanced', icon: Zap },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Settings</h2>
            <p className="text-neutral-600">Manage your account and preferences</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-neutral-200 p-4 overflow-y-auto">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Full Name
                      </label>
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Company
                      </label>
                      <Input
                        value={profileData.company}
                        onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Your company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Location
                      </label>
                      <Input
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Website
                      </label>
                      <Input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Bio
                    </label>
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                  <div className="mt-6">
                    <Button
                      onClick={handleProfileUpdate}
                      loading={isLoading}
                      className="interactive"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Monitor },
                    ].map((themeOption) => {
                      const Icon = themeOption.icon;
                      return (
                        <button
                          key={themeOption.id}
                          onClick={() => setTheme(themeOption.id)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            theme === themeOption.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <Icon className="h-6 w-6 mx-auto mb-2 text-neutral-600" />
                          <p className="text-sm font-medium text-neutral-900">{themeOption.label}</p>
                          {theme === themeOption.id && (
                            <Check className="h-4 w-4 text-primary-600 mx-auto mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Editor Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Font Size
                      </label>
                      <select
                        value={editor.fontSize}
                        onChange={(e) => updateEditorSettings({ fontSize: parseInt(e.target.value) })}
                        className="input"
                      >
                        {[10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24].map(size => (
                          <option key={size} value={size}>{size}px</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Tab Size
                      </label>
                      <select
                        value={editor.tabSize}
                        onChange={(e) => updateEditorSettings({ tabSize: parseInt(e.target.value) })}
                        className="input"
                      >
                        {[2, 4, 8].map(size => (
                          <option key={size} value={size}>{size} spaces</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Key Binding
                      </label>
                      <select
                        value={editor.keyBinding}
                        onChange={(e) => updateEditorSettings({ keyBinding: e.target.value })}
                        className="input"
                      >
                        <option value="default">Default</option>
                        <option value="vim">Vim</option>
                        <option value="emacs">Emacs</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Word Wrap
                      </label>
                      <select
                        value={editor.wordWrap}
                        onChange={(e) => updateEditorSettings({ wordWrap: e.target.value })}
                        className="input"
                      >
                        <option value="off">Off</option>
                        <option value="on">On</option>
                        <option value="wordWrapColumn">At column</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <h4 className="font-medium text-neutral-900">Editor Features</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: 'minimap', label: 'Show Minimap' },
                        { key: 'lineNumbers', label: 'Line Numbers' },
                        { key: 'folding', label: 'Code Folding' },
                        { key: 'formatOnSave', label: 'Format on Save' },
                        { key: 'formatOnPaste', label: 'Format on Paste' },
                        { key: 'smoothScrolling', label: 'Smooth Scrolling' },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={editor[key]}
                            onChange={(e) => updateEditorSettings({ [key]: e.target.checked })}
                            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-neutral-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'enabled', label: 'Enable Notifications', description: 'Receive notifications about your projects' },
                      { key: 'desktop', label: 'Desktop Notifications', description: 'Show notifications on your desktop' },
                      { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                      { key: 'projectUpdates', label: 'Project Updates', description: 'Notifications about project changes' },
                      { key: 'collaborationUpdates', label: 'Collaboration Updates', description: 'Notifications about collaboration activities' },
                      { key: 'systemUpdates', label: 'System Updates', description: 'Notifications about system maintenance and updates' },
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-start space-x-3 p-3 rounded-xl border border-neutral-200">
                        <input
                          type="checkbox"
                          checked={notifications[key]}
                          onChange={(e) => updateNotificationSettings({ [key]: e.target.checked })}
                          className="mt-1 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <p className="font-medium text-neutral-900">{label}</p>
                          <p className="text-sm text-neutral-600">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Profile Visibility
                      </label>
                      <select
                        value={privacy.profileVisibility}
                        onChange={(e) => updatePrivacySettings({ profileVisibility: e.target.value })}
                        className="input"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="friends">Friends Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Default Project Visibility
                      </label>
                      <select
                        value={privacy.projectVisibility}
                        onChange={(e) => updatePrivacySettings({ projectVisibility: e.target.value })}
                        className="input"
                      >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                      </select>
                    </div>
                    
                    <div className="space-y-3 mt-6">
                      {[
                        { key: 'showActivity', label: 'Show Activity Status', description: 'Let others see when you\'re active' },
                        { key: 'allowCollaboration', label: 'Allow Collaboration Requests', description: 'Allow others to request collaboration' },
                        { key: 'dataCollection', label: 'Allow Data Collection', description: 'Help improve the platform with usage data' },
                        { key: 'analytics', label: 'Analytics', description: 'Allow analytics tracking for better experience' },
                      ].map(({ key, label, description }) => (
                        <div key={key} className="flex items-start space-x-3 p-3 rounded-xl border border-neutral-200">
                          <input
                            type="checkbox"
                            checked={privacy[key]}
                            onChange={(e) => updatePrivacySettings({ [key]: e.target.checked })}
                            className="mt-1 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div>
                            <p className="font-medium text-neutral-900">{label}</p>
                            <p className="text-sm text-neutral-600">{description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Accessibility Options</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Font Size
                      </label>
                      <select
                        value={accessibility.fontSize}
                        onChange={(e) => updateAccessibilitySettings({ fontSize: e.target.value })}
                        className="input"
                      >
                        <option value="small">Small</option>
                        <option value="normal">Normal</option>
                        <option value="large">Large</option>
                        <option value="extra-large">Extra Large</option>
                      </select>
                    </div>
                    
                    <div className="space-y-3 mt-6">
                      {[
                        { key: 'highContrast', label: 'High Contrast Mode', description: 'Increase contrast for better visibility' },
                        { key: 'reducedMotion', label: 'Reduce Motion', description: 'Minimize animations and transitions' },
                        { key: 'screenReader', label: 'Screen Reader Support', description: 'Optimize for screen readers' },
                        { key: 'keyboardNavigation', label: 'Enhanced Keyboard Navigation', description: 'Improve keyboard navigation support' },
                        { key: 'focusIndicators', label: 'Enhanced Focus Indicators', description: 'Show clear focus indicators' },
                      ].map(({ key, label, description }) => (
                        <div key={key} className="flex items-start space-x-3 p-3 rounded-xl border border-neutral-200">
                          <input
                            type="checkbox"
                            checked={accessibility[key]}
                            onChange={(e) => updateAccessibilitySettings({ [key]: e.target.checked })}
                            className="mt-1 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div>
                            <p className="font-medium text-neutral-900">{label}</p>
                            <p className="text-sm text-neutral-600">{description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Advanced Settings</h3>
                  <div className="space-y-4">
                    <Card className="p-4">
                      <h4 className="font-medium text-neutral-900 mb-2">Settings Management</h4>
                      <p className="text-sm text-neutral-600 mb-4">
                        Export your settings to back them up or import settings from another device.
                      </p>
                      <div className="flex space-x-3">
                        <Button
                          onClick={exportSettings}
                          variant="secondary"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Settings
                        </Button>
                        <div>
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleFileImport}
                            className="hidden"
                            id="import-settings"
                          />
                          <Button
                            onClick={() => document.getElementById('import-settings').click()}
                            variant="secondary"
                            size="sm"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Import Settings
                          </Button>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 border-warning-200 bg-warning-50">
                      <h4 className="font-medium text-warning-900 mb-2">Reset Settings</h4>
                      <p className="text-sm text-warning-700 mb-4">
                        This will reset all your settings to their default values. This action cannot be undone.
                      </p>
                      <Button
                        onClick={resetToDefaults}
                        variant="destructive"
                        size="sm"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset to Defaults
                      </Button>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;