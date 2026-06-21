import { Helmet } from 'react-helmet-async';
import type { SiteSettings } from '@/lib/types';
import { getEnv } from '@/lib/utils';

interface JsonLdProps {
  settings?: SiteSettings;
  type?: 'LocalBusiness' | 'WebPage' | 'Service' | 'ImageGallery';
  data?: Record<string, unknown>;
}

const siteUrl = getEnv('VITE_SITE_URL', 'http://localhost:5173');

export function JsonLd({ settings, type = 'LocalBusiness', data }: JsonLdProps) {
  const base = {
  '@context': 'https://schema.org',
  '@type': type,
  name: settings?.siteName ?? 'SK Makeup Artist',
  description: settings?.tagline,
  url: siteUrl,
  ...(settings?.contactDetails?.email && { email: settings.contactDetails.email }),
  ...(settings?.contactDetails?.phone && { telephone: settings.contactDetails.phone }),
  ...(settings?.contactDetails?.address && {
    address: { '@type': 'PostalAddress', streetAddress: settings.contactDetails.address },
  }),
  ...data,
};

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(base)}</script>
    </Helmet>
  );
}
