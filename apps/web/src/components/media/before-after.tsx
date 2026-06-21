import { useState, useRef, useCallback, useEffect } from 'react';
import { CloudinaryImg } from './cloudinary-image';
import type { CloudinaryImage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BeforeAfterProps {
  before: CloudinaryImage;
  after: CloudinaryImage;
  className?: string;
}

export function BeforeAfter({ before, after, className }: BeforeAfterProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.offsetWidth));
    ro.observe(el);
    setWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const handleMove = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, x)));
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('relative aspect-[4/5] cursor-ew-resize select-none overflow-hidden', className)}
      onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      role="img"
      aria-label="Before and after comparison"
    >
      <CloudinaryImg image={after} preset="gallery" className="absolute inset-0" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <div style={{ width: width || '100%' }}>
          <CloudinaryImg image={before} preset="gallery" className="aspect-[4/5]" />
        </div>
      </div>
      <div className="absolute inset-y-0 z-10 w-0.5 bg-gold shadow-gold" style={{ left: `${position}%` }}>
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gold bg-charcoal/80 text-xs font-medium text-gold">
          ↔
        </div>
      </div>
      <span className="absolute bottom-4 left-4 bg-charcoal/60 px-3 py-1 text-xs uppercase tracking-wider text-ivory">Before</span>
      <span className="absolute bottom-4 right-4 bg-charcoal/60 px-3 py-1 text-xs uppercase tracking-wider text-ivory">After</span>
    </div>
  );
}
