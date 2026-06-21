import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-gold via-[#d4b978] to-gold text-charcoal shadow-gold hover:shadow-lg hover:brightness-105 active:scale-[0.98]',
        secondary:
          'border border-charcoal/15 bg-gradient-to-b from-white to-ivory-dark text-charcoal shadow-sm hover:border-gold/40 hover:shadow-md',
        ghost: 'text-charcoal hover:bg-gold/10 hover:text-charcoal',
        destructive:
          'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md hover:from-red-700 hover:to-red-800',
        success:
          'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md hover:from-emerald-700 hover:to-emerald-800',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
);
Button.displayName = 'Button';
