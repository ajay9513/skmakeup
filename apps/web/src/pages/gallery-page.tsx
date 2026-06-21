import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
import { useInfiniteGallery, useSeo } from '@/hooks/use-public-api';
import type { CloudinaryImage, GalleryAlbum } from '@/lib/types';

export function GalleryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lightboxImages, setLightboxImages] = useState<CloudinaryImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteGallery({
    search: search || undefined,
    category: category || undefined,
    limit: 12,
  });
  const { data: seo } = useSeo('gallery');

  const albums = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data?.pages]);

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

  const openAlbum = (album: GalleryAlbum, imageIndex: number) => {
    setLightboxImages(album.images);
    setLightboxIndex(imageIndex);
  };

  return (
    <>
      <SeoHead page="gallery" seo={seo} title="Gallery | SK Makeup Artist" />

      <Section className="bg-charcoal pt-4">
        <Container className="py-16 text-center md:py-20">
          <h1 className="luxury-heading text-4xl text-ivory md:text-5xl">Gallery</h1>
          <p className="mt-4 text-ivory/60">Curated collections of our finest work</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/40" />
              <Input
                placeholder="Search albums..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                aria-label="Search gallery"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setCategory('')} className={`px-4 py-2 text-xs uppercase tracking-wider ${!category ? 'bg-charcoal text-ivory' : 'bg-charcoal/5'}`}>All</button>
              {PORTFOLIO_CATEGORIES.map((cat) => (
                <button key={cat} type="button" onClick={() => setCategory(cat)} className={`px-4 py-2 text-xs uppercase tracking-wider ${category === cat ? 'bg-charcoal text-ivory' : 'bg-charcoal/5'}`}>{cat}</button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3]" />)}
            </div>
          ) : (
            <div className="space-y-16">
              {albums.map((album) => (
                <FadeIn key={album._id}>
                  <div className="mb-6">
                    <h2 className="font-serif text-2xl">{album.title}</h2>
                    {album.description && <p className="mt-2 text-charcoal/60">{album.description}</p>}
                  </div>
                  <MasonryGrid>
                    {album.images.map((img, i) => (
                      <MasonryItem key={`${album._id}-${i}`}>
                        <button type="button" onClick={() => openAlbum(album, i)} className="w-full overflow-hidden">
                          <CloudinaryImg image={img} preset="gallery" className="w-full transition-transform hover:scale-105" />
                        </button>
                      </MasonryItem>
                    ))}
                  </MasonryGrid>
                </FadeIn>
              ))}
            </div>
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
