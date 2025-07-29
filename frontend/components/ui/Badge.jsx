import { forwardRef } from 'react';
import { cn } from '@/utils/helpers';

const Badge = forwardRef(({ className, variant = 'primary', children, ...props }, ref) => {
  const variants = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
  };

  return (
    <span
      ref={ref}
      className={cn('badge', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;