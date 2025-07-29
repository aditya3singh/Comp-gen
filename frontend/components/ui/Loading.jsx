import { Loader2, Sparkles } from 'lucide-react';

const Loading = ({ 
  size = 'md', 
  text = 'Loading...', 
  variant = 'default',
  className = '' 
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  if (variant === 'page') {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-subtle">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-3xl flex items-center justify-center mb-4 mx-auto shadow-glow">
            <Sparkles className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">{text}</p>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-3xl flex items-center justify-center mb-4 mx-auto shadow-glow">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <p className="text-neutral-600">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin text-primary-600 ${sizes[size]}`} />
      {text && <span className="ml-2 text-neutral-600">{text}</span>}
    </div>
  );
};

export default Loading;