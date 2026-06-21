import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wider text-charcoal/70">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        className={cn(
          'flex min-h-[120px] w-full resize-y border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal transition placeholder:text-charcoal/40 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30',
          error && 'border-red-400',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  ),
);
Textarea.displayName = 'Textarea';
