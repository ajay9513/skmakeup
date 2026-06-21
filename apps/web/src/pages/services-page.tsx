import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Container, Section } from '@/components/shared/section';
import { FadeIn } from '@/components/shared/motion';
import { CloudinaryImg } from '@/components/media/cloudinary-image';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SeoHead } from '@/components/seo/seo-head';
import { useServices, useSeo } from '@/hooks/use-public-api';
import { formatPrice } from '@/lib/utils';

const CATEGORIES = ['bridal', 'reception', 'engagement', 'party', 'editorial', 'fashion', 'hd_makeup', 'airbrush', 'other'] as const;

export function ServicesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { data, isLoading } = useServices({ search: search || undefined, category: category || undefined, limit: 50 });
  const { data: seo } = useSeo('services');

  const categories = useMemo(() => {
    const cats = new Set(data?.items.map((s) => s.category) ?? []);
    return CATEGORIES.filter((c) => cats.has(c));
  }, [data?.items]);

  return (
    <>
      <SeoHead page="services" seo={seo} />

      <Section className="bg-charcoal pt-4">
        <Container className="py-16 text-center md:py-20">
          <h1 className="luxury-heading text-4xl text-ivory md:text-5xl">Services</h1>
          <p className="mt-4 text-ivory/60">Luxury makeup artistry for every occasion</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/40" />
              <Input
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                aria-label="Search services"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory('')}
                className={`px-4 py-2 text-xs uppercase tracking-wider transition ${!category ? 'bg-charcoal text-ivory' : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10'}`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 text-xs uppercase tracking-wider transition ${category === cat ? 'bg-charcoal text-ivory' : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10'}`}
                >
                  {cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5]" />
              ))}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {data?.items.map((service, i) => (
                <FadeIn key={service._id} delay={i * 0.05}>
                  <Link to={`/services/${service.slug}`} className="group block overflow-hidden bg-white shadow-luxury">
                    <CloudinaryImg image={service.featuredImage} preset="gallery" className="aspect-[4/5] transition-transform duration-700 group-hover:scale-105" />
                    <div className="p-6">
                      <Badge>{service.category.replace(/_/g, ' ')}</Badge>
                      <h2 className="mt-3 font-serif text-2xl">{service.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm text-charcoal/60">{service.shortDescription}</p>
                      <p className="mt-4 font-medium text-gold">From {formatPrice(service.startingPrice, service.currency)}</p>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}

          {!isLoading && data?.items.length === 0 && (
            <p className="py-16 text-center text-charcoal/50">No services found.</p>
          )}
        </Container>
      </Section>
    </>
  );
}
