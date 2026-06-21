import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wider text-charcoal/70">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={cn(
          'flex h-11 w-full appearance-none border border-charcoal/15 bg-white px-4 text-sm text-charcoal focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30',
          error && 'border-red-400',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  ),
);
Select.displayName = 'Select';
