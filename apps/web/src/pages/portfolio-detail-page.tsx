import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Container, Section } from '@/components/shared/section';
import { FadeIn } from '@/components/shared/motion';
import { CloudinaryImg } from '@/components/media/cloudinary-image';
import { BeforeAfter } from '@/components/media/before-after';
import { Lightbox } from '@/components/media/lightbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SeoHead } from '@/components/seo/seo-head';
import { BreadcrumbJsonLd, PortfolioJsonLd } from '@/components/seo/structured-data';
import { PortfolioCta } from '@/components/conversion/conversion-banner';
import { usePortfolioItem, usePortfolioPreview } from '@/hooks/use-public-api';
import type { CloudinaryImage } from '@/lib/types';

export function PortfolioDetailPage() {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const previewToken = searchParams.get('preview');
  const { data: publishedData, isLoading: pubLoading, isError: pubError } = usePortfolioItem(slug);
  const { data: previewData, isLoading: prevLoading } = usePortfolioPreview(previewToken ?? '');
  const { data, isLoading, isError } = previewToken
    ? { data: previewData ? { item: previewData.item, related: [] } : undefined, isLoading: prevLoading, isError: !previewData && !prevLoading }
    : { data: publishedData, isLoading: pubLoading, isError: pubError };
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const item = data?.item;
  const related = data?.related ?? [];

  const allImages: CloudinaryImage[] = item
    ? [item.featuredImage, ...(item.galleryImages ?? [])]
    : [];

  if (isLoading) {
    return (
      <Section>
        <Container><Skeleton className="aspect-[16/9] w-full" /></Container>
      </Section>
    );
  }

  if (isError || !item) {
    return (
      <Section>
        <Container className="py-24 text-center">
          <h1 className="font-serif text-3xl">Portfolio item not found</h1>
          <Link to="/portfolio" className="mt-6 inline-block"><Button>Back to Portfolio</Button></Link>
        </Container>
      </Section>
    );
  }

  return (
    <>
      <SeoHead
        page={`portfolio/${slug}`}
        title={item.title}
        description={item.description}
        image={item.featuredImage}
        type="article"
        noIndex={Boolean(previewToken)}
      />
      <BreadcrumbJsonLd items={[{ name: 'Home', path: '/' }, { name: 'Portfolio', path: '/portfolio' }, { name: item.title, path: `/portfolio/${slug}` }]} />
      <PortfolioJsonLd title={item.title} description={item.description} image={item.featuredImage?.secureUrl} url={`/portfolio/${slug}`} />

      {previewToken && (
        <div className="bg-gold/20 py-2 text-center text-sm text-charcoal" role="status">Preview Mode — This item is not publicly visible</div>
      )}

      <section className="relative">
        <CloudinaryImg image={item.featuredImage} preset="hero" className="aspect-[16/9] max-h-[80vh]" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />
        <Container className="absolute bottom-0 left-0 right-0 pb-12">
          <Badge className="mb-4">{item.category}</Badge>
          <h1 className="luxury-heading text-4xl text-ivory md:text-5xl">{item.title}</h1>
        </Container>
      </section>

      <Section>
        <Container>
          {item.description && (
            <FadeIn>
              <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-charcoal/80">{item.description}</p>
            </FadeIn>
          )}

          {item.beforeImage && item.afterImage && (
            <div className="mx-auto mt-16 max-w-2xl">
              <h2 className="mb-6 text-center font-serif text-2xl">Transformation</h2>
              <BeforeAfter before={item.beforeImage} after={item.afterImage} />
            </div>
          )}

          {allImages.length > 1 && (
            <div className="mt-16">
              <h2 className="mb-8 text-center font-serif text-2xl">Gallery</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="overflow-hidden focus:ring-2 focus:ring-gold"
                    aria-label={`View image ${i + 1}`}
                  >
                    <CloudinaryImg image={img} preset="gallery" className="aspect-square transition-transform hover:scale-105" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="mb-8 text-center font-serif text-2xl">Related Works</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((r) => (
                  <Link key={r._id} to={`/portfolio/${r.slug}`} className="group overflow-hidden">
                    <CloudinaryImg image={r.featuredImage} preset="thumbnail" className="aspect-[3/4] transition-transform group-hover:scale-105" />
                    <p className="mt-2 font-serif text-lg">{r.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <PortfolioCta />

          <div className="mt-16 text-center">
            <Link to="/book"><Button size="lg">Book a Session</Button></Link>
          </div>
        </Container>
      </Section>

      {lightboxIndex !== null && (
        <Lightbox
          images={allImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
