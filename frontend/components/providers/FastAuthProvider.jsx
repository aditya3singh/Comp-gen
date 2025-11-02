'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export function FastAuthProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      // Check if we're in the browser
      if (typeof window === 'undefined') {
        setIsInitialized(true);
        return;
      }

      // Fast synchronous check first
      const localTokens = localStorage.getItem('authTokens');
      const sessionTokens = sessionStorage.getItem('authTokens');
      
      if (!localTokens && !sessionTokens) {
        // No tokens, skip auth check
        setIsInitialized(true);
        return;
      }

      // Has tokens, do full auth check
      await checkAuth();
      setIsInitialized(true);
    };

    initAuth();
  }, [checkAuth]);

  // Check if we're in browser and have tokens
  const hasTokens = typeof window !== 'undefined' && 
    (localStorage.getItem('authTokens') || sessionStorage.getItem('authTokens'));

  // Show loading only if we have tokens but haven't finished checking
  if (!isInitialized && hasTokens) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  return children;
}