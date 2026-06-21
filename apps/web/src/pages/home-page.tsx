import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CloudinaryImg } from '@/components/media/cloudinary-image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container, Section, SectionHeader } from '@/components/shared/section';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/shared/motion';
import { BeforeAfter } from '@/components/media/before-after';
import { SeoHead } from '@/components/seo/seo-head';
import { LocalBusinessJsonLd } from '@/components/seo/structured-data';
import {
  usePageContent,
  useSeo,
  useSiteSettings,
  useServices,
  usePortfolio,
  useTestimonials,
  useTeamMembers,
} from '@/hooks/use-public-api';
import { getContentImage, getContentText } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { PortfolioItem } from '@/lib/types';

export function HomePage() {
  const { data: settings } = useSiteSettings();
  const { data: contentData } = usePageContent('homepage');
  const { data: seo } = useSeo('homepage');
  const { data: servicesData } = useServices({ limit: 4, featured: true });
  const { data: portfolioData } = usePortfolio({ limit: 6, featured: true });
  const { data: testimonials } = useTestimonials();
  const { data: team } = useTeamMembers();

  const content = contentData?.content ?? {};
  const heroHeadline = getContentText(content, 'homepage.hero.headline');
  const heroSub = getContentText(content, 'homepage.hero.subheadline');
  const heroCta = getContentText(content, 'homepage.hero.ctaLabel');
  const heroHref = getContentText(content, 'homepage.hero.ctaHref') || '/book';
  const heroImage = getContentImage(content, 'homepage.hero.backgroundImage');
  const introTitle = getContentText(content, 'homepage.intro.title');
  const introBody = getContentText(content, 'homepage.intro.body');
  const ctaTitle = getContentText(content, 'homepage.cta.title');
  const ctaButton = getContentText(content, 'homepage.cta.buttonLabel');

  const stats = [
    { key: 'homepage.stats.experience', label: 'Years Experience' },
    { key: 'homepage.stats.clients', label: 'Happy Clients' },
    { key: 'homepage.stats.events', label: 'Events' },
    { key: 'homepage.stats.awards', label: 'Awards' },
  ].filter((s) => getContentText(content, s.key));

  const beforeAfterItems = (portfolioData?.items ?? []).filter(
    (p): p is PortfolioItem => Boolean(p.beforeImage && p.afterImage),
  ).slice(0, 3);

  const featuredTestimonials = (testimonials ?? []).filter((t) => t.isFeatured).slice(0, 3);
  const featuredTeam = (team ?? []).filter((m) => m.isFeatured).slice(0, 4);

  return (
    <>
      <SeoHead page="homepage" seo={seo} />
      <LocalBusinessJsonLd settings={settings} />

      {/* Hero */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-charcoal">
        {heroImage ? (
          <CloudinaryImg image={heroImage} preset="hero" className="absolute inset-0" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal-dark" />
        )}
        <div className="absolute inset-0 bg-charcoal/50" />
        <Container className="relative z-10 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            {heroHeadline && (
              <h1 className="luxury-heading text-balance text-4xl text-ivory sm:text-5xl md:text-6xl lg:text-7xl">
                {heroHeadline}
              </h1>
            )}
            {heroSub && (
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ivory/80 md:text-lg">
                {heroSub}
              </p>
            )}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {heroCta && (
                <Link to={heroHref}>
                  <Button size="lg">{heroCta}</Button>
                </Link>
              )}
              <Link to="/portfolio">
                <Button variant="outline" size="lg" className="border-ivory/30 text-ivory hover:bg-ivory/10">
                  View Portfolio
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="h-12 w-px bg-gradient-to-b from-gold to-transparent"
          />
        </div>
      </section>

      {/* Stats */}
      {stats.length > 0 && (
        <Section className="border-y border-charcoal/5 bg-white py-12 md:py-16">
          <Container>
            <StaggerContainer className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <StaggerItem key={stat.key} className="text-center">
                  <p className="font-serif text-3xl text-gold md:text-4xl">{getContentText(content, stat.key)}</p>
                  <p className="mt-2 text-xs uppercase tracking-luxury text-charcoal/60">{stat.label}</p>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </Section>
      )}

      {/* Intro */}
      {(introTitle || introBody) && (
        <Section>
          <Container>
            <FadeIn className="mx-auto max-w-3xl text-center">
              {introTitle && <h2 className="luxury-heading text-3xl md:text-4xl">{introTitle}</h2>}
              {introBody && <p className="mt-6 text-lg leading-relaxed text-charcoal/70">{introBody}</p>}
            </FadeIn>
          </Container>
        </Section>
      )}

      {/* Services Preview */}
      {(servicesData?.items.length ?? 0) > 0 && (
        <Section dark>
          <Container>
            <SectionHeader eyebrow="Services" title="Curated Artistry" description="Bespoke makeup experiences tailored to your vision." light />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {servicesData?.items.map((service, i) => (
                <FadeIn key={service._id} delay={i * 0.1}>
                  <Link to={`/services/${service.slug}`} className="group block overflow-hidden bg-charcoal-light">
                    <CloudinaryImg image={service.featuredImage} preset="thumbnail" className="aspect-[4/5] transition-transform duration-700 group-hover:scale-105" />
                    <div className="p-5">
                      <Badge variant="outline" className="border-gold/30 text-gold-light">{service.category.replace(/_/g, ' ')}</Badge>
                      <h3 className="mt-3 font-serif text-xl text-ivory">{service.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-ivory/60">{service.shortDescription}</p>
                      <p className="mt-3 text-sm text-gold">From {formatPrice(service.startingPrice, service.currency)}</p>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link to="/services">
                <Button variant="outline" className="border-gold/40 text-gold hover:bg-gold/10">
                  All Services <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Container>
        </Section>
      )}

      {/* Featured Portfolio */}
      {(portfolioData?.items.length ?? 0) > 0 && (
        <Section>
          <Container>
            <SectionHeader eyebrow="Portfolio" title="Featured Works" description="A glimpse into our artistry." />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {portfolioData?.items.map((item, i) => (
                <FadeIn key={item._id} delay={i * 0.08}>
                  <Link to={`/portfolio/${item.slug}`} className="group relative block overflow-hidden">
                    <CloudinaryImg image={item.featuredImage} preset="gallery" className="aspect-[3/4] transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 right-0 translate-y-4 p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="text-xs uppercase tracking-luxury text-gold">{item.category}</p>
                      <h3 className="mt-1 font-serif text-xl text-ivory">{item.title}</h3>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link to="/portfolio"><Button>Explore Portfolio</Button></Link>
            </div>
          </Container>
        </Section>
      )}

      {/* Before / After */}
      {beforeAfterItems.length > 0 && (
        <Section dark>
          <Container>
            <SectionHeader eyebrow="Transformations" title="Before & After" light />
            <div className="grid gap-8 md:grid-cols-3">
              {beforeAfterItems.map((item, i) => (
                <FadeIn key={item._id} delay={i * 0.1}>
                  <BeforeAfter before={item.beforeImage!} after={item.afterImage!} />
                  <p className="mt-4 text-center font-serif text-lg text-ivory">{item.title}</p>
                </FadeIn>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Testimonials */}
      {featuredTestimonials.length > 0 && (
        <Section>
          <Container>
            <SectionHeader eyebrow="Testimonials" title="Client Love" />
            <div className="grid gap-8 md:grid-cols-3">
              {featuredTestimonials.map((t, i) => (
                <FadeIn key={t._id} delay={i * 0.1}>
                  <blockquote className="border-l-2 border-gold pl-6">
                    <div className="mb-3 flex gap-1 text-gold">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <span key={j}>★</span>
                      ))}
                    </div>
                    <p className="font-serif text-lg italic leading-relaxed text-charcoal/80">&ldquo;{t.content}&rdquo;</p>
                    <footer className="mt-4">
                      <cite className="not-italic">
                        <span className="font-medium text-charcoal">{t.clientName}</span>
                        {t.clientRole && <span className="text-charcoal/50"> — {t.clientRole}</span>}
                      </cite>
                    </footer>
                  </blockquote>
                </FadeIn>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link to="/testimonials"><Button variant="outline">Read More</Button></Link>
            </div>
          </Container>
        </Section>
      )}

      {/* Team Preview */}
      {featuredTeam.length > 0 && (
        <Section className="bg-white">
          <Container>
            <SectionHeader eyebrow="The Team" title="Meet the Artists" />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {featuredTeam.map((member, i) => (
                <FadeIn key={member._id} delay={i * 0.1} className="text-center">
                  <CloudinaryImg image={member.profileImage} preset="avatar" className="mx-auto aspect-square w-48 rounded-full" />
                  <h3 className="mt-4 font-serif text-xl">{member.name}</h3>
                  <p className="text-sm text-gold">{member.designation}</p>
                  {member.shortDescription && (
                    <p className="mt-2 text-sm text-charcoal/60">{member.shortDescription}</p>
                  )}
                </FadeIn>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Contact CTA */}
      {ctaTitle && (
        <Section dark className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/10 to-transparent" />
          <Container className="relative text-center">
            <FadeIn>
              <h2 className="luxury-heading text-3xl text-ivory md:text-5xl">{ctaTitle}</h2>
              <Link to="/book" className="mt-8 inline-block">
                <Button size="lg">{ctaButton || 'Book Now'}</Button>
              </Link>
            </FadeIn>
          </Container>
        </Section>
      )}
    </>
  );
}
