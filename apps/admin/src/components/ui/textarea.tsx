import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }>(
  ({ className, label, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-xs font-medium text-charcoal/70">{label}</label>}
      <textarea
        id={id}
        ref={ref}
        className={cn('luxury-input min-h-[100px] resize-y', className)}
        {...props}
      />
    </div>
  ),
);
Textarea.displayName = 'Textarea';
