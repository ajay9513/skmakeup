import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { CloudinaryImg } from './cloudinary-image';
import type { CloudinaryImage } from '@/lib/types';

interface LightboxProps {
  images: CloudinaryImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ images, currentIndex, onClose, onNavigate }: LightboxProps) {
  const image = images[currentIndex];

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    },
    [currentIndex, images.length, onClose, onNavigate],
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [handleKey]);

  if (!image) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/95 p-4"
        role="dialog"
        aria-modal
        aria-label="Image lightbox"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-ivory/80 transition hover:bg-white/10 hover:text-ivory"
          aria-label="Close lightbox"
        >
          <X className="h-6 w-6" />
        </button>

        {currentIndex > 0 && (
          <button
            type="button"
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-4 z-10 rounded-full p-2 text-ivory/80 transition hover:bg-white/10"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}

        {currentIndex < images.length - 1 && (
          <button
            type="button"
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-4 z-10 mr-12 rounded-full p-2 text-ivory/80 transition hover:bg-white/10"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-h-[90vh] max-w-5xl"
        >
          <CloudinaryImg image={image} preset="lightbox" className="max-h-[85vh] w-auto" priority />
          {image.caption && (
            <p className="mt-4 text-center text-sm text-ivory/70">{image.caption}</p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
