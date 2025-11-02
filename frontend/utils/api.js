import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  // Enable HTTP/2 and connection reuse
  maxRedirects: 3,
  // Optimize for speed
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

// Token cache for faster access
let cachedToken = null;
let tokenCacheTime = 0;
const TOKEN_CACHE_TTL = 30000; // 30 seconds

// Add auth token to requests - Optimized
api.interceptors.request.use((config) => {
  // Use cached token if available and fresh
  if (cachedToken && (Date.now() - tokenCacheTime < TOKEN_CACHE_TTL)) {
    config.headers.Authorization = `Bearer ${cachedToken}`;
    return config;
  }
  
  // Get fresh token
  let token = null;
  
  try {
    const localTokens = localStorage.getItem('authTokens');
    const sessionTokens = sessionStorage.getItem('authTokens');
    const tokenData = localTokens ? JSON.parse(localTokens) : 
                     sessionTokens ? JSON.parse(sessionTokens) : null;
    
    if (tokenData && tokenData.token) {
      token = tokenData.token;
      // Cache the token
      cachedToken = token;
      tokenCacheTime = Date.now();
    }
  } catch (error) {
    console.warn('Token parsing error:', error);
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors - Optimized with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear cached token
      cachedToken = null;
      tokenCacheTime = 0;
      
      // Try to refresh token
      try {
        const localTokens = localStorage.getItem('authTokens');
        const sessionTokens = sessionStorage.getItem('authTokens');
        const tokenData = localTokens ? JSON.parse(localTokens) : 
                         sessionTokens ? JSON.parse(sessionTokens) : null;
        
        if (tokenData?.refreshToken) {
          const response = await api.post('/auth/refresh', {
            refreshToken: tokenData.refreshToken
          });
          
          if (response.data.token) {
            // Update stored tokens
            const newTokenData = {
              ...tokenData,
              token: response.data.token,
              refreshToken: response.data.refreshToken || tokenData.refreshToken,
              expiresAt: Date.now() + (12 * 60 * 60 * 1000) // 12 hours
            };
            
            const storage = localTokens ? localStorage : sessionStorage;
            storage.setItem('authTokens', JSON.stringify(newTokenData));
            
            // Cache new token
            cachedToken = response.data.token;
            tokenCacheTime = Date.now();
            
            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.warn('Token refresh failed:', refreshError);
      }
      
      // If refresh fails, redirect to login
      localStorage.removeItem('authTokens');
      sessionStorage.removeItem('authTokens');
      window.location.href = '/auth/login';
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password, rememberMe = false) => {
    console.log('API: Making POST request to /auth/login with:', { email, rememberMe });
    const response = await api.post('/auth/login', { email, password, rememberMe });
    console.log('API: Login response received:', response.data);
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.patch('/auth/profile', profileData);
    return response.data;
  },

  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  register: async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Session API
export const sessionAPI = {
  getSessions: async (page = 1, limit = 10, search = '') => {
    const response = await api.get('/sessions', {
      params: { page, limit, search },
    });
    return response.data;
  },

  getSession: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },

  createSession: async (title, description, tags) => {
    const response = await api.post('/sessions', { title, description, tags });
    return response.data;
  },

  updateSession: async (sessionId, updates) => {
    const response = await api.patch(`/sessions/${sessionId}`, updates);
    return response.data;
  },

  addMessage: async (sessionId, message) => {
    const response = await api.post(`/sessions/${sessionId}/messages`, message);
    return response.data;
  },

  saveComponent: async (sessionId, jsx, css, props = {}, messageId) => {
    const response = await api.post(`/sessions/${sessionId}/components`, {
      jsx, css, props, messageId
    });
    return response.data;
  },
};

// AI API
export const aiAPI = {
  generateComponent: async (request) => {
    const response = await api.post('/ai/generate', request);
    return response.data;
  },

  refineComponent: async (request) => {
    const response = await api.post('/ai/refine', request);
    return response.data;
  },
};

// Export API
export const exportAPI = {
  exportZip: async (sessionId, options) => {
    const response = await api.post('/export/zip', {
      sessionId,
      ...options,
    }, {
      responseType: 'blob',
    });
    return response.data;
  },

  getCode: async (sessionId, format = 'jsx') => {
    const response = await api.get(`/export/code/${sessionId}`, {
      params: { format },
    });
    return response.data;
  },
};

// Project API (using session API as base for now)
export const projectAPI = {
  getProjects: async (page = 1, limit = 20, search = '', sortBy = 'lastModified', filterBy = 'all') => {
    const response = await api.get('/sessions', {
      params: { page, limit, search, sortBy, filterBy },
    });
    return {
      projects: response.data.sessions,
      total: response.data.total || response.data.sessions.length,
      totalComponents: response.data.sessions.reduce((acc, s) => acc + (s.componentHistory?.length || 0), 0),
      storageUsed: response.data.sessions.reduce((acc, s) => acc + (s.size || 1024), 0),
    };
  },

  getProject: async (projectId) => {
    const response = await api.get(`/sessions/${projectId}`);
    return { project: response.data.session };
  },

  createProject: async (projectData) => {
    const response = await api.post('/sessions', {
      title: projectData.name || projectData.title,
      description: projectData.description,
      tags: projectData.tags,
    });
    return { project: response.data.session };
  },

  updateProject: async (projectId, updates) => {
    const response = await api.patch(`/sessions/${projectId}`, updates);
    return { project: response.data.session };
  },

  deleteProject: async (projectId) => {
    await api.delete(`/sessions/${projectId}`);
    return { success: true };
  },

  duplicateProject: async (projectId) => {
    const response = await api.post(`/sessions/${projectId}/duplicate`);
    return { project: response.data.session };
  },

  shareProject: async (projectId, shareSettings) => {
    const response = await api.patch(`/sessions/${projectId}/sharing`, shareSettings);
    return { sharing: response.data.sharing };
  },

  exportProject: async (projectId, format = 'zip') => {
    const response = await api.post('/export/zip', {
      sessionId: projectId,
      format,
    }, {
      responseType: 'blob',
    });
    return {
      data: response.data,
      contentType: response.headers['content-type'],
      filename: `project-${projectId}.${format}`,
    };
  },

  importProject: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/import/project', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { project: response.data.session };
  },

  getTemplates: async () => {
    // Mock templates for now
    return {
      templates: [
        { id: 'react-component', name: 'React Component', description: 'Basic React functional component' },
        { id: 'ui-card', name: 'UI Card', description: 'Modern card component with variants' },
        { id: 'form-component', name: 'Form Component', description: 'Complete form with validation' },
      ]
    };
  },

  createFromTemplate: async (templateId, projectName) => {
    const response = await api.post('/sessions', {
      title: projectName,
      description: `Created from ${templateId} template`,
      tags: ['template', templateId],
      template: templateId,
    });
    return { project: response.data.session };
  },
};

export default api;