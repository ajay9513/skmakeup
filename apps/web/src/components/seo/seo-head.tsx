import { Helmet } from 'react-helmet-async';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { getEnv } from '@/lib/utils';
import type { SeoData } from '@/lib/types';
import type { CloudinaryImage } from '@/lib/types';

interface SeoHeadProps {
  page: string;
  seo?: SeoData;
  title?: string;
  description?: string;
  image?: CloudinaryImage;
  type?: string;
  noIndex?: boolean;
}

const siteUrl = getEnv('VITE_SITE_URL', 'http://localhost:5173');

export function SeoHead({ page, seo, title, description, image, type = 'website', noIndex }: SeoHeadProps) {
  const metaTitle = title ?? seo?.seo?.metaTitle ?? seo?.defaults?.metaTitle ?? seo?.siteName ?? 'SK Makeup Artist';
  const metaDescription =
    description ?? seo?.seo?.metaDescription ?? seo?.defaults?.metaDescription ?? '';
  const ogImage = image ?? seo?.seo?.openGraph?.image;
  const ogImageUrl = getCloudinaryUrl(ogImage, 'hero');
  const canonical = seo?.seo?.canonicalUrl ?? `${siteUrl}/${page === 'homepage' ? '' : page}`;
  const keywords = seo?.seo?.keywords?.join(', ');

  return (
    <Helmet>
      <title>{metaTitle}</title>
      {metaDescription && <meta name="description" content={metaDescription} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />
      {noIndex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow" />
      )}

      <meta property="og:title" content={seo?.seo?.openGraph?.title ?? metaTitle} />
      <meta property="og:description" content={seo?.seo?.openGraph?.description ?? metaDescription} />
      {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={seo?.seo?.openGraph?.type ?? type} />
      <meta property="og:site_name" content={seo?.siteName ?? 'SK Makeup Artist'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}
    </Helmet>
  );
}
