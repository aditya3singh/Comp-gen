import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

export const useSettingsStore = create()(
  persist(
    (set, get) => ({
      // UI Settings
      theme: 'light',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      // Editor Settings
      editor: {
        fontSize: 14,
        fontFamily: 'JetBrains Mono',
        tabSize: 2,
        insertSpaces: true,
        wordWrap: 'on',
        lineNumbers: 'on',
        minimap: true,
        folding: true,
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        formatOnSave: true,
        formatOnPaste: true,
        theme: 'vs-code-dark',
        keyBinding: 'default', // default, vim, emacs
        cursorStyle: 'line',
        cursorBlinking: 'blink',
        renderWhitespace: 'selection',
        rulers: [80, 120],
        smoothScrolling: true,
        mouseWheelZoom: true,
      },

      // Auto-save Settings
      autoSave: {
        enabled: true,
        interval: 30000, // 30 seconds
        onFocusChange: true,
        onWindowClose: true,
      },

      // Notification Settings
      notifications: {
        enabled: true,
        desktop: true,
        email: true,
        projectUpdates: true,
        collaborationUpdates: true,
        systemUpdates: true,
        marketingEmails: false,
      },

      // Privacy Settings
      privacy: {
        profileVisibility: 'public', // public, private, friends
        projectVisibility: 'private', // public, private, unlisted
        showActivity: true,
        allowCollaboration: true,
        dataCollection: true,
        analytics: true,
      },

      // Collaboration Settings
      collaboration: {
        defaultPermission: 'view', // view, edit, admin
        allowComments: true,
        allowSuggestions: true,
        autoAcceptInvites: false,
        notifyOnChanges: true,
      },

      // Performance Settings
      performance: {
        previewRefreshRate: 'fast', // slow, normal, fast, instant
        codeCompletion: true,
        errorChecking: true,
        linting: true,
        autoImports: true,
        inlineHints: true,
        backgroundSync: true,
      },

      // Accessibility Settings
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        screenReader: false,
        keyboardNavigation: true,
        focusIndicators: true,
        fontSize: 'normal', // small, normal, large, extra-large
      },

      // Backup Settings
      backup: {
        autoBackup: true,
        backupInterval: 'daily', // hourly, daily, weekly
        retentionPeriod: 30, // days
        cloudSync: true,
      },

      // Update theme
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
        toast.success(`Switched to ${theme} theme`, { icon: theme === 'dark' ? '🌙' : '☀️' });
      },

      // Update language
      setLanguage: (language) => {
        set({ language });
        toast.success('Language updated');
      },

      // Update editor settings
      updateEditorSettings: (settings) => {
        set(state => ({
          editor: { ...state.editor, ...settings }
        }));
        toast.success('Editor settings updated');
      },

      // Update auto-save settings
      updateAutoSaveSettings: (settings) => {
        set(state => ({
          autoSave: { ...state.autoSave, ...settings }
        }));
        toast.success('Auto-save settings updated');
      },

      // Update notification settings
      updateNotificationSettings: (settings) => {
        set(state => ({
          notifications: { ...state.notifications, ...settings }
        }));
        toast.success('Notification settings updated');
      },

      // Update privacy settings
      updatePrivacySettings: (settings) => {
        set(state => ({
          privacy: { ...state.privacy, ...settings }
        }));
        toast.success('Privacy settings updated');
      },

      // Update collaboration settings
      updateCollaborationSettings: (settings) => {
        set(state => ({
          collaboration: { ...state.collaboration, ...settings }
        }));
        toast.success('Collaboration settings updated');
      },

      // Update performance settings
      updatePerformanceSettings: (settings) => {
        set(state => ({
          performance: { ...state.performance, ...settings }
        }));
        toast.success('Performance settings updated');
      },

      // Update accessibility settings
      updateAccessibilitySettings: (settings) => {
        set(state => ({
          accessibility: { ...state.accessibility, ...settings }
        }));
        
        // Apply accessibility changes immediately
        if (settings.highContrast !== undefined) {
          document.documentElement.classList.toggle('high-contrast', settings.highContrast);
        }
        if (settings.reducedMotion !== undefined) {
          document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
        }
        if (settings.fontSize !== undefined) {
          document.documentElement.setAttribute('data-font-size', settings.fontSize);
        }
        
        toast.success('Accessibility settings updated');
      },

      // Update backup settings
      updateBackupSettings: (settings) => {
        set(state => ({
          backup: { ...state.backup, ...settings }
        }));
        toast.success('Backup settings updated');
      },

      // Reset to defaults
      resetToDefaults: () => {
        const defaultSettings = {
          theme: 'light',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          editor: {
            fontSize: 14,
            fontFamily: 'JetBrains Mono',
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            lineNumbers: 'on',
            minimap: true,
            folding: true,
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            formatOnSave: true,
            formatOnPaste: true,
            theme: 'vs-code-dark',
            keyBinding: 'default',
            cursorStyle: 'line',
            cursorBlinking: 'blink',
            renderWhitespace: 'selection',
            rulers: [80, 120],
            smoothScrolling: true,
            mouseWheelZoom: true,
          },
          autoSave: {
            enabled: true,
            interval: 30000,
            onFocusChange: true,
            onWindowClose: true,
          },
          notifications: {
            enabled: true,
            desktop: true,
            email: true,
            projectUpdates: true,
            collaborationUpdates: true,
            systemUpdates: true,
            marketingEmails: false,
          },
          privacy: {
            profileVisibility: 'public',
            projectVisibility: 'private',
            showActivity: true,
            allowCollaboration: true,
            dataCollection: true,
            analytics: true,
          },
          collaboration: {
            defaultPermission: 'view',
            allowComments: true,
            allowSuggestions: true,
            autoAcceptInvites: false,
            notifyOnChanges: true,
          },
          performance: {
            previewRefreshRate: 'fast',
            codeCompletion: true,
            errorChecking: true,
            linting: true,
            autoImports: true,
            inlineHints: true,
            backgroundSync: true,
          },
          accessibility: {
            highContrast: false,
            reducedMotion: false,
            screenReader: false,
            keyboardNavigation: true,
            focusIndicators: true,
            fontSize: 'normal',
          },
          backup: {
            autoBackup: true,
            backupInterval: 'daily',
            retentionPeriod: 30,
            cloudSync: true,
          },
        };
        
        set(defaultSettings);
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.classList.remove('high-contrast', 'reduced-motion');
        document.documentElement.setAttribute('data-font-size', 'normal');
        
        toast.success('Settings reset to defaults', { icon: '🔄' });
      },

      // Export settings
      exportSettings: () => {
        const settings = get();
        const settingsBlob = new Blob([JSON.stringify(settings, null, 2)], {
          type: 'application/json'
        });
        
        const url = URL.createObjectURL(settingsBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `component-builder-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Settings exported successfully', { icon: '📤' });
      },

      // Import settings
      importSettings: (settingsFile) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const importedSettings = JSON.parse(e.target.result);
              
              // Validate settings structure
              if (typeof importedSettings === 'object' && importedSettings !== null) {
                set(importedSettings);
                
                // Apply theme and accessibility settings
                if (importedSettings.theme) {
                  document.documentElement.setAttribute('data-theme', importedSettings.theme);
                }
                if (importedSettings.accessibility) {
                  const { highContrast, reducedMotion, fontSize } = importedSettings.accessibility;
                  document.documentElement.classList.toggle('high-contrast', highContrast);
                  document.documentElement.classList.toggle('reduced-motion', reducedMotion);
                  document.documentElement.setAttribute('data-font-size', fontSize || 'normal');
                }
                
                toast.success('Settings imported successfully', { icon: '📥' });
                resolve(true);
              } else {
                throw new Error('Invalid settings file format');
              }
            } catch (error) {
              toast.error('Failed to import settings: ' + error.message);
              reject(error);
            }
          };
          reader.onerror = () => {
            toast.error('Failed to read settings file');
            reject(new Error('File read error'));
          };
          reader.readAsText(settingsFile);
        });
      },

      // Get current settings summary
      getSettingsSummary: () => {
        const state = get();
        return {
          theme: state.theme,
          language: state.language,
          editorTheme: state.editor.theme,
          fontSize: state.editor.fontSize,
          autoSave: state.autoSave.enabled,
          notifications: state.notifications.enabled,
          privacy: state.privacy.profileVisibility,
          accessibility: {
            highContrast: state.accessibility.highContrast,
            reducedMotion: state.accessibility.reducedMotion,
            fontSize: state.accessibility.fontSize,
          }
        };
      },
    }),
    {
      name: 'settings-storage',
      version: 1,
    }
  )
);