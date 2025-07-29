import { forwardRef } from 'react';
import { cn } from '@/utils/helpers';

const Button = forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  disabled,
  loading,
  ...props 
}, ref) => {
  const baseClasses = 'btn';
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    outline: 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50',
    destructive: 'bg-error-600 text-white hover:bg-error-700',
  };
  
  const sizes = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'opacity-75 cursor-wait',
        className
      )}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;