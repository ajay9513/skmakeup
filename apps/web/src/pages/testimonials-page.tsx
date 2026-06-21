import { Container, Section, SectionHeader } from '@/components/shared/section';
import { FadeIn } from '@/components/shared/motion';
import { CloudinaryImg } from '@/components/media/cloudinary-image';
import { SeoHead } from '@/components/seo/seo-head';
import { useTestimonials, useSeo } from '@/hooks/use-public-api';

export function TestimonialsPage() {
  const { data: testimonials, isLoading } = useTestimonials();
  const { data: seo } = useSeo('testimonials');

  return (
    <>
      <SeoHead page="testimonials" seo={seo} title="Testimonials | SK Makeup Artist" />

      <Section className="bg-charcoal pt-4">
        <Container className="py-16 text-center md:py-20">
          <h1 className="luxury-heading text-4xl text-ivory md:text-5xl">Testimonials</h1>
          <p className="mt-4 text-ivory/60">Stories from our cherished clients</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader title="What Clients Say" description="Every bride, every event, every moment — treasured." />

          {isLoading ? (
            <p className="text-center text-charcoal/50">Loading...</p>
          ) : (
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {testimonials?.map((t, i) => (
                <FadeIn key={t._id} delay={i * 0.08}>
                  <article className="flex h-full flex-col bg-white p-8 shadow-luxury">
                    {t.avatar && (
                      <CloudinaryImg image={t.avatar} preset="avatar" className="mb-4 h-14 w-14 rounded-full" />
                    )}
                    <div className="mb-4 flex gap-1 text-gold" aria-label={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: t.rating }).map((_, j) => <span key={j}>★</span>)}
                    </div>
                    <blockquote className="flex-1 font-serif text-lg italic leading-relaxed text-charcoal/80">
                      &ldquo;{t.content}&rdquo;
                    </blockquote>
                    <footer className="mt-6 border-t border-charcoal/10 pt-4">
                      <p className="font-medium">{t.clientName}</p>
                      {t.clientRole && <p className="text-sm text-charcoal/50">{t.clientRole}</p>}
                    </footer>
                  </article>
                </FadeIn>
              ))}
            </div>
          )}

          {!isLoading && testimonials?.length === 0 && (
            <p className="py-16 text-center text-charcoal/50">No testimonials yet.</p>
          )}
        </Container>
      </Section>
    </>
  );
}
