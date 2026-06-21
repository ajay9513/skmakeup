import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wider text-charcoal/70">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          'flex h-11 w-full border border-charcoal/15 bg-white px-4 text-sm text-charcoal transition placeholder:text-charcoal/40 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30',
          error && 'border-red-400',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
