import { useParams, Link } from 'react-router-dom';
import { Container, Section } from '@/components/shared/section';
import { FadeIn } from '@/components/shared/motion';
import { CloudinaryImg } from '@/components/media/cloudinary-image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SeoHead } from '@/components/seo/seo-head';
import { BreadcrumbJsonLd, ServiceJsonLd } from '@/components/seo/structured-data';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { useService } from '@/hooks/use-public-api';
import { formatPrice } from '@/lib/utils';

export function ServiceDetailPage() {
  const { slug = '' } = useParams();
  const { data: service, isLoading, isError } = useService(slug);

  if (isLoading) {
    return (
      <Section>
        <Container><Skeleton className="aspect-[21/9] w-full" /></Container>
      </Section>
    );
  }

  if (isError || !service) {
    return (
      <Section>
        <Container className="py-24 text-center">
          <h1 className="font-serif text-3xl">Service not found</h1>
          <Link to="/services" className="mt-6 inline-block"><Button>Back to Services</Button></Link>
        </Container>
      </Section>
    );
  }

  return (
    <>
      <SeoHead
        page={`services/${slug}`}
        title={service.title}
        description={service.shortDescription}
        image={service.featuredImage}
        type="Service"
      />
      <BreadcrumbJsonLd items={[{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }, { name: service.title, path: `/services/${slug}` }]} />
      <ServiceJsonLd
        name={service.title}
        description={service.shortDescription}
        price={service.startingPrice}
        currency={service.currency}
        image={getCloudinaryUrl(service.featuredImage, 'hero')}
      />

      <section className="relative">
        <CloudinaryImg image={service.featuredImage} preset="hero" className="aspect-[21/9] max-h-[70vh]" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
        <Container className="absolute bottom-0 left-0 right-0 pb-12">
          <Badge className="mb-4">{service.category.replace(/_/g, ' ')}</Badge>
          <h1 className="luxury-heading text-4xl text-ivory md:text-5xl">{service.title}</h1>
          <p className="mt-2 text-gold">From {formatPrice(service.startingPrice, service.currency)} · {service.duration} min</p>
        </Container>
      </section>

      <Section>
        <Container>
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <div className="whitespace-pre-line text-lg leading-relaxed text-charcoal/80">{service.fullDescription}</div>
            </FadeIn>
            <div className="mt-10">
              <Link to="/book"><Button size="lg">Book This Service</Button></Link>
            </div>
          </div>

          {(service.galleryImages?.length ?? 0) > 0 && (
            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {service.galleryImages?.map((img, i) => (
                <CloudinaryImg key={i} image={img} preset="gallery" className="aspect-square" />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
