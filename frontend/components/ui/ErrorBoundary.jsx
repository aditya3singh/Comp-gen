import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';
import { Card } from './Card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-error-100 rounded-3xl flex items-center justify-center mb-4 mx-auto">
            <AlertTriangle className="h-8 w-8 text-error-600" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-neutral-600 mb-6">
            {this.props.fallbackMessage || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onRetry) {
                this.props.onRetry();
              } else {
                window.location.reload();
              }
            }}
            className="interactive"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;