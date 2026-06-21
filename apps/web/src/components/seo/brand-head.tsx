import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '@/hooks/use-public-api';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import type { CloudinaryImage } from '@/lib/types';

function iconUrl(img?: CloudinaryImage | null) {
  if (!img?.publicId) return undefined;
  return getCloudinaryUrl(img, 'adminGrid') ?? img.secureUrl ?? img.url;
}

export function BrandHead() {
  const { data: settings } = useSiteSettings();
  const branding = settings?.brandingSettings;
  const favicon = iconUrl(branding?.favicon ?? settings?.logo);
  const apple = iconUrl(branding?.appleTouchIcon ?? branding?.logo ?? settings?.logo);

  return (
    <Helmet>
      {favicon && <link rel="icon" href={favicon} />}
      {apple && <link rel="apple-touch-icon" href={apple} />}
    </Helmet>
  );
}
