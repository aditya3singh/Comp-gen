'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-error-100 rounded-3xl flex items-center justify-center mb-6 mx-auto">
          <AlertTriangle className="h-12 w-12 text-error-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Something went wrong
        </h1>
        
        <p className="text-neutral-600 mb-8">
          An unexpected error occurred. Please try refreshing the page or go back to the homepage.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="btn btn-primary btn-lg interactive"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="btn btn-secondary btn-lg"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Link>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-700">
              Show error details
            </summary>
            <pre className="mt-4 p-4 bg-neutral-100 rounded-lg text-xs overflow-auto">
              {error?.message || 'Unknown error'}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}