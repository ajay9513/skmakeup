import { ImgHTMLAttributes, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlurPlaceholder, getCloudinaryUrl, getSrcSet } from '@/lib/cloudinary';
import type { CloudinaryImage } from '@/lib/types';
import type { CLOUDINARY_PRESETS } from '@sk-makeup/shared';

interface CloudinaryImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  image?: CloudinaryImage | null;
  preset?: keyof typeof CLOUDINARY_PRESETS;
  aspectRatio?: string;
  priority?: boolean;
}

export function CloudinaryImg({
  image,
  preset = 'gallery',
  alt,
  className,
  aspectRatio,
  priority = false,
  ...props
}: CloudinaryImgProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = getCloudinaryUrl(image, preset) ?? image?.secureUrl;
  const srcSet = getSrcSet(image);
  const blur = getBlurPlaceholder(image);

  if (!src || failed) {
    return (
      <div className={cn('flex items-center justify-center bg-gradient-to-br from-champagne/40 to-ivory-dark', aspectRatio, className)} aria-hidden>
        <ImageIcon className="h-8 w-8 text-charcoal/20" />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', aspectRatio, className)}>
      {blur && !loaded && (
        <img
          src={blur}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
        />
      )}
      <img
        src={src}
        srcSet={srcSet}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        alt={alt ?? image?.alt ?? ''}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
        {...props}
      />
    </div>
  );
}
