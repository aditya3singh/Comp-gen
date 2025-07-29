import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/utils/api';
import toast from 'react-hot-toast';

const SESSION_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before logout
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      rememberMe: false,
      lastActivity: Date.now(),
      sessionWarningShown: false,
      preferences: {
        theme: 'light',
        autoSave: true,
        autoSaveInterval: 30000,
        editorFontSize: 14,
        editorTabSize: 2,
        editorTheme: 'vs-code',
        keyBinding: 'default',
        notifications: true,
        language: 'en',
      },
      stats: {
        projectsCreated: 0,
        totalSessions: 0,
        lastLoginDate: null,
        accountCreated: null,
      },

      // Activity tracking
      updateActivity: () => {
        set({ lastActivity: Date.now(), sessionWarningShown: false });
      },

      // Session management
      startActivityTracking: () => {
        const updateActivity = get().updateActivity;
        ACTIVITY_EVENTS.forEach(event => {
          document.addEventListener(event, updateActivity, true);
        });
        
        // Check session every minute
        const sessionInterval = setInterval(() => {
          const { lastActivity, isAuthenticated, showSessionWarning, logout } = get();
          if (!isAuthenticated) {
            clearInterval(sessionInterval);
            return;
          }
          
          const timeSinceActivity = Date.now() - lastActivity;
          const timeUntilLogout = SESSION_TIMEOUT - timeSinceActivity;
          
          if (timeUntilLogout <= 0) {
            logout(true); // Auto logout
            clearInterval(sessionInterval);
          } else if (timeUntilLogout <= WARNING_TIME && !get().sessionWarningShown) {
            showSessionWarning();
          }
        }, 60000);
      },

      showSessionWarning: () => {
        set({ sessionWarningShown: true });
        toast((t) => (
          <div className="flex flex-col space-y-3 p-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warning-500 rounded-full animate-pulse"></div>
              <p className="font-semibold text-neutral-900">Session expiring soon</p>
            </div>
            <p className="text-sm text-neutral-600">You'll be logged out in 5 minutes due to inactivity.</p>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  get().updateActivity();
                  toast.dismiss(t.id);
                }}
                className="btn btn-primary btn-sm"
              >
                Stay logged in
              </button>
              <button
                onClick={() => {
                  get().logout();
                  toast.dismiss(t.id);
                }}
                className="btn btn-secondary btn-sm"
              >
                Logout now
              </button>
            </div>
          </div>
        ), {
          duration: WARNING_TIME,
          id: 'session-warning',
          style: {
            background: 'white',
            border: '1px solid #f59e0b',
            borderRadius: '12px',
            padding: '16px',
          }
        });
      },

      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(email, password, rememberMe);
          
          if (response.token && response.user) {
            const tokenData = {
              token: response.token,
              refreshToken: response.refreshToken,
              expiresAt: Date.now() + SESSION_TIMEOUT
            };
            
            if (rememberMe) {
              localStorage.setItem('authTokens', JSON.stringify(tokenData));
            } else {
              sessionStorage.setItem('authTokens', JSON.stringify(tokenData));
            }
            
            set({
              user: response.user,
              token: response.token,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              rememberMe,
              lastActivity: Date.now(),
              stats: {
                ...get().stats,
                totalSessions: get().stats.totalSessions + 1,
                lastLoginDate: new Date().toISOString(),
              }
            });
            
            get().startActivityTracking();
            toast.success(`Welcome back, ${response.user.name}!`, {
              icon: '👋',
              duration: 4000,
            });
            return true;
          }
          
          throw new Error('Invalid response');
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.message || 'Login failed');
          return false;
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(email, password, name);
          
          if (response.token && response.user) {
            const tokenData = {
              token: response.token,
              refreshToken: response.refreshToken,
              expiresAt: Date.now() + SESSION_TIMEOUT
            };
            
            sessionStorage.setItem('authTokens', JSON.stringify(tokenData));
            
            set({
              user: response.user,
              token: response.token,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              lastActivity: Date.now(),
              stats: {
                projectsCreated: 0,
                totalSessions: 1,
                lastLoginDate: new Date().toISOString(),
                accountCreated: new Date().toISOString(),
              }
            });
            
            get().startActivityTracking();
            toast.success(`Welcome to the platform, ${response.user.name}!`, {
              icon: '🎉',
              duration: 5000,
            });
            return true;
          }
          
          throw new Error('Invalid response');
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.message || 'Registration failed');
          return false;
        }
      },

      refreshAuthToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const response = await authAPI.refreshToken(refreshToken);
          if (response.token) {
            const tokenData = {
              token: response.token,
              refreshToken: response.refreshToken || refreshToken,
              expiresAt: Date.now() + SESSION_TIMEOUT
            };
            
            const storage = get().rememberMe ? localStorage : sessionStorage;
            storage.setItem('authTokens', JSON.stringify(tokenData));
            
            set({
              token: response.token,
              refreshToken: response.refreshToken || refreshToken,
              lastActivity: Date.now()
            });
            
            return true;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
        }
        return false;
      },

      logout: (isAutoLogout = false) => {
        localStorage.removeItem('authTokens');
        sessionStorage.removeItem('authTokens');
        
        // Remove activity listeners
        const updateActivity = get().updateActivity;
        ACTIVITY_EVENTS.forEach(event => {
          document.removeEventListener(event, updateActivity, true);
        });
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          lastActivity: Date.now(),
          sessionWarningShown: false
        });
        
        if (isAutoLogout) {
          toast.error('You have been logged out due to inactivity', {
            icon: '⏰',
            duration: 5000,
          });
        } else {
          toast.success('Logged out successfully', {
            icon: '👋',
          });
        }
      },

      checkAuth: async () => {
        const localTokens = localStorage.getItem('authTokens');
        const sessionTokens = sessionStorage.getItem('authTokens');
        const tokenData = localTokens ? JSON.parse(localTokens) : 
                         sessionTokens ? JSON.parse(sessionTokens) : null;

        if (!tokenData || !tokenData.token) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        // Check if token is expired
        if (Date.now() > tokenData.expiresAt) {
          const refreshed = await get().refreshAuthToken();
          if (!refreshed) {
            set({ isAuthenticated: false, isLoading: false });
            return;
          }
        }

        set({ isLoading: true });
        try {
          const response = await authAPI.getMe();
          if (response.user) {
            set({
              user: response.user,
              token: tokenData.token,
              refreshToken: tokenData.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              rememberMe: !!localTokens,
              lastActivity: Date.now()
            });
            
            get().startActivityTracking();
          } else {
            throw new Error('Invalid user');
          }
        } catch (error) {
          localStorage.removeItem('authTokens');
          sessionStorage.removeItem('authTokens');
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.updateProfile(profileData);
          set({
            user: { ...get().user, ...response.user },
            isLoading: false
          });
          toast.success('Profile updated successfully', { icon: '✅' });
          return true;
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.message || 'Failed to update profile');
          return false;
        }
      },

      updatePreferences: (newPreferences) => {
        set({
          preferences: { ...get().preferences, ...newPreferences }
        });
        toast.success('Preferences updated', { icon: '⚙️' });
      },

      updateStats: (statUpdates) => {
        set({
          stats: { ...get().stats, ...statUpdates }
        });
      },

      requestPasswordReset: async (email) => {
        try {
          await authAPI.requestPasswordReset(email);
          toast.success('Password reset email sent', { icon: '📧' });
          return true;
        } catch (error) {
          toast.error(error.message || 'Failed to send reset email');
          return false;
        }
      },

      resetPassword: async (token, newPassword) => {
        try {
          await authAPI.resetPassword(token, newPassword);
          toast.success('Password reset successfully', { icon: '🔒' });
          return true;
        } catch (error) {
          toast.error(error.message || 'Failed to reset password');
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        preferences: state.preferences,
        stats: state.stats,
        rememberMe: state.rememberMe,
      }),
    }
  )
);