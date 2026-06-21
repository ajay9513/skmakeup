import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('container-luxury', className)} {...props} />;
}

interface SectionProps extends HTMLAttributes<HTMLElement> {
  dark?: boolean;
}

export function Section({ className, dark, ...props }: SectionProps) {
  return (
    <section
      className={cn('section-padding', dark ? 'bg-charcoal text-ivory' : 'bg-ivory', className)}
      {...props}
    />
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  light?: boolean;
}

export function SectionHeader({ eyebrow, title, description, align = 'center', light }: SectionHeaderProps) {
  return (
    <div className={cn('mb-12 md:mb-16', align === 'center' && 'text-center')}>
      {eyebrow && <p className={cn('luxury-subheading mb-3', light && 'text-gold-light')}>{eyebrow}</p>}
      <h2 className={cn('luxury-heading text-3xl md:text-4xl lg:text-5xl', light && 'text-ivory')}>{title}</h2>
      {description && (
        <p className={cn('mt-4 max-w-2xl text-base leading-relaxed md:text-lg', align === 'center' && 'mx-auto', light ? 'text-ivory/70' : 'text-charcoal/70')}>
          {description}
        </p>
      )}
      <div className={cn('luxury-divider mt-6', align === 'left' && 'mx-0')} />
    </div>
  );
}
