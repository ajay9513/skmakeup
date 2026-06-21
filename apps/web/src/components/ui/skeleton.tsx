import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-charcoal/5 via-charcoal/10 to-charcoal/5 bg-[length:200%_100%]',
        className,
      )}
      aria-hidden
    />
  );
}
