import { Helmet } from 'react-helmet-async';
import { getEnv } from '@/lib/utils';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import type { SiteSettings } from '@/lib/types';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

const siteUrl = getEnv('VITE_SITE_URL', 'http://localhost:5173');

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

export function FaqJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (!faqs.length) return null;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

export function ServiceJsonLd({
  name,
  description,
  price,
  currency = 'USD',
  image,
}: {
  name: string;
  description: string;
  price: number;
  currency?: string;
  image?: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: { '@type': 'LocalBusiness', name: 'SK Makeup Artist' },
    offers: { '@type': 'Offer', price, priceCurrency: currency },
    ...(image && { image }),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

export function PortfolioJsonLd({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description?: string;
  image?: string;
  url: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: title,
    description,
    url: `${siteUrl}${url}`,
    ...(image && { image }),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

export function LocalBusinessJsonLd({ settings }: { settings?: SiteSettings }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: settings?.siteName || 'SK Makeup Artist',
    description: settings?.tagline,
    url: siteUrl,
    ...(settings?.contactDetails?.email && { email: settings.contactDetails.email }),
    ...(settings?.contactDetails?.phone && { telephone: settings.contactDetails.phone }),
    ...(settings?.contactDetails?.address && {
      address: { '@type': 'PostalAddress', streetAddress: settings.contactDetails.address },
    }),
    priceRange: '$$$',
    ...(settings?.logo && { image: getCloudinaryUrl(settings.logo, 'hero') }),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
