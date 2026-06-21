import { Link } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/use-public-api';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import type { CloudinaryImage } from '@/lib/types';
import { scrollToTop } from '@/lib/scroll-nav';

interface SiteLogoProps {
  variant?: 'light' | 'dark' | 'mobile';
  className?: string;
}

function pickLogo(
  branding: Record<string, CloudinaryImage | undefined> | undefined,
  legacy: CloudinaryImage | undefined,
  variant: SiteLogoProps['variant'],
) {
  if (!branding && legacy) return legacy;
  if (variant === 'dark') return branding?.darkLogo ?? branding?.logo ?? legacy;
  if (variant === 'mobile') return branding?.mobileLogo ?? branding?.logo ?? legacy;
  return branding?.logo ?? legacy;
}

export function SiteLogo({ variant = 'light', className }: SiteLogoProps) {
  const { data: settings } = useSiteSettings();
  const [imgFailed, setImgFailed] = useState(false);
  const branding = settings?.brandingSettings as Record<string, CloudinaryImage | undefined> | undefined;
  const image = pickLogo(branding, settings?.logo, variant);
  const url = !imgFailed ? getCloudinaryUrl(image, 'adminGrid') : undefined;
  const name = settings?.siteName ?? 'SK Makeup Artist';

  return (
    <Link to="/" onClick={scrollToTop} className={cn('inline-flex items-center gap-2', className)}>
      {url ? (
        <img
          src={url}
          alt={name}
          onError={() => setImgFailed(true)}
          className={cn(
            'h-8 w-auto object-contain md:h-10',
            variant === 'mobile' && 'h-7 md:h-8',
          )}
        />
      ) : (
        <span className={cn(
          'font-serif text-xl tracking-wide md:text-2xl',
          variant === 'light' ? 'text-ivory' : 'text-charcoal',
        )}>
          {name}
        </span>
      )}
    </Link>
  );
}
