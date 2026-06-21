import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group relative inline-flex items-center justify-center overflow-hidden font-sans text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-gold via-gold-light to-gold text-charcoal-dark shadow-luxury hover:shadow-gold hover:scale-[1.02] before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-full',
        outline:
          'border border-gold/50 bg-white/60 text-charcoal backdrop-blur-sm hover:border-gold hover:bg-gold/10 hover:shadow-gold',
        ghost: 'text-charcoal hover:bg-champagne/60',
        ivory:
          'border border-charcoal/10 bg-ivory text-charcoal shadow-sm hover:border-gold/40 hover:shadow-luxury',
        dark:
          'bg-gradient-to-r from-charcoal-dark to-charcoal text-ivory shadow-luxury hover:from-charcoal hover:to-charcoal-light hover:shadow-gold',
        rose:
          'bg-gradient-to-r from-rosegold to-rosegold-light text-white shadow-luxury hover:scale-[1.02] hover:shadow-gold',
      },
      size: {
        default: 'h-11 px-6 rounded-full',
        sm: 'h-9 px-4 text-xs rounded-full',
        lg: 'h-12 px-8 text-base rounded-full',
        icon: 'h-11 w-11 rounded-full',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </span>
      )}
      <span className={cn('relative z-10 inline-flex items-center gap-2', loading && 'opacity-0')}>{children}</span>
    </button>
  ),
);
Button.displayName = 'Button';
