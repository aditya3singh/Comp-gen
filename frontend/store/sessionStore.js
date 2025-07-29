import { create } from 'zustand';
import { sessionAPI } from '@/utils/api';
import toast from 'react-hot-toast';

export const useSessionStore = create((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,

  fetchSessions: async (page = 1, search = '') => {
    set({ isLoading: true, error: null });
    try {
      const response = await sessionAPI.getSessions(page, 10, search);
      set({
        sessions: response.sessions,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error.message || 'Failed to fetch sessions',
        isLoading: false
      });
      toast.error('Failed to load sessions');
    }
  },

  createSession: async (title, description, tags) => {
    set({ isLoading: true, error: null });
    try {
      const response = await sessionAPI.createSession(title, description, tags);

      if (response.session) {
        const newSession = response.session;
        set(state => ({
          sessions: [newSession, ...state.sessions],
          currentSession: newSession,
          isLoading: false
        }));

        toast.success('Session created');
        return newSession;
      }

      throw new Error('Invalid response');
    } catch (error) {
      set({
        error: error.message || 'Failed to create session',
        isLoading: false
      });
      toast.error('Failed to create session');
      return null;
    }
  },

  loadSession: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await sessionAPI.getSession(sessionId);

      if (response.session) {
        set({
          currentSession: response.session,
          isLoading: false
        });
      } else {
        throw new Error('Session not found');
      }
    } catch (error) {
      set({
        error: error.message || 'Failed to load session',
        isLoading: false
      });
      toast.error('Failed to load session');
    }
  },

  setCurrentSession: (session) => {
    set({ currentSession: session });
  },

  clearError: () => {
    set({ error: null });
  },
}));