'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 gradient-primary rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-glow">
          <span className="text-4xl text-white font-bold">404</span>
        </div>
        
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-neutral-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="btn btn-primary btn-lg interactive"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary btn-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}