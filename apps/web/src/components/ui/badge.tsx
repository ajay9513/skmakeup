import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center px-3 py-1 text-xs font-medium uppercase tracking-wider', {
  variants: {
    variant: {
      default: 'bg-gold/10 text-gold-dark',
      outline: 'border border-gold/30 text-gold-dark',
      dark: 'bg-charcoal text-ivory',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
