import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  size?: 'md' | 'lg' | 'xl' | 'full';
}

const sizes = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
};

export function Modal({ open, onClose, title, children, className, size = 'lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-charcoal/50 p-4 pt-16 backdrop-blur-sm">
      <div role="dialog" aria-modal aria-labelledby="modal-title" className={cn('w-full rounded-xl bg-white shadow-luxury', sizes[size], className)}>
        <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-4">
          <h2 id="modal-title" className="font-serif text-xl font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-charcoal/50 hover:bg-ivory-dark hover:text-charcoal" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
