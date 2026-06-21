import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PORTFOLIO_CATEGORIES } from '@sk-makeup/shared';
import { Container, Section } from '@/components/shared/section';
import { FadeIn } from '@/components/shared/motion';
import { CloudinaryImg } from '@/components/media/cloudinary-image';
import { MasonryGrid, MasonryItem } from '@/components/media/masonry-grid';
import { Lightbox } from '@/components/media/lightbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SeoHead } from '@/components/seo/seo-head';
import { useInfinitePortfolio, useSeo } from '@/hooks/use-public-api';
import type { PortfolioItem } from '@/lib/types';

export function PortfolioPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfinitePortfolio({
    search: search || undefined,
    category: category || undefined,
    limit: 12,
    sort: '-displayOrder',
  });
  const { data: seo } = useSeo('portfolio');

  const items = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data?.pages],
  );

  const lightboxImages = useMemo(
    () => items.map((item) => item.featuredImage),
    [items],
  );

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const categories = useMemo(() => {
    const cats = new Set(items.map((i) => i.category));
    return PORTFOLIO_CATEGORIES.filter((c) => cats.has(c));
  }, [items]);

  return (
    <>
      <SeoHead page="portfolio" seo={seo} />

      <Section className="bg-charcoal pt-4">
        <Container className="py-16 text-center md:py-20">
          <h1 className="luxury-heading text-4xl text-ivory md:text-6xl">Portfolio</h1>
          <p className="mt-4 max-w-lg mx-auto text-ivory/60">Editorial artistry. Bridal elegance. Timeless beauty.</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/40" />
              <Input
                placeholder="Search portfolio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                aria-label="Search portfolio"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterButton active={!category} onClick={() => setCategory('')}>All</FilterButton>
              {categories.map((cat) => (
                <FilterButton key={cat} active={category === cat} onClick={() => setCategory(cat)}>
                  {cat}
                </FilterButton>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4]" />
              ))}
            </div>
          ) : (
            <MasonryGrid>
              {items.map((item, index) => (
                <MasonryItem key={item._id}>
                  <PortfolioCard
                    item={item}
                    onPreview={() => setLightboxIndex(index)}
                  />
                </MasonryItem>
              ))}
            </MasonryGrid>
          )}

          {!isLoading && items.length === 0 && (
            <p className="py-16 text-center text-charcoal/50">No portfolio items found.</p>
          )}

          <div ref={loadMoreRef} className="mt-12 flex justify-center">
            {isFetchingNextPage && <Skeleton className="h-10 w-40" />}
            {hasNextPage && !isFetchingNextPage && (
              <Button variant="outline" onClick={() => void fetchNextPage()}>Load More</Button>
            )}
          </div>
        </Container>
      </Section>

      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-xs uppercase tracking-wider transition ${active ? 'bg-charcoal text-ivory' : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10'}`}
    >
      {children}
    </button>
  );
}

function PortfolioCard({ item, onPreview }: { item: PortfolioItem; onPreview: () => void }) {
  return (
    <FadeIn>
      <div className="group relative overflow-hidden bg-white shadow-luxury">
        <Link to={`/portfolio/${item.slug}`}>
          <CloudinaryImg
            image={item.featuredImage}
            preset="gallery"
            className="w-full transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-charcoal/70 via-transparent to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="flex w-full items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-luxury text-gold">{item.category}</p>
              <h2 className="font-serif text-lg text-ivory">{item.title}</h2>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onPreview(); }}
              className="text-xs uppercase tracking-wider text-ivory/80 hover:text-gold"
              aria-label={`Preview ${item.title}`}
            >
              Preview
            </button>
          </div>
        </div>
        {item.beforeImage && item.afterImage && (
          <span className="absolute right-3 top-3 bg-gold/90 px-2 py-1 text-[10px] uppercase tracking-wider text-charcoal">
            Before / After
          </span>
        )}
      </div>
    </FadeIn>
  );
}
