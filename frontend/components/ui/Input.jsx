import { forwardRef } from 'react';
import { cn } from '@/utils/helpers';

const Input = forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn('input', className)}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

const Textarea = forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'input min-h-[80px] resize-none',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Input, Textarea };