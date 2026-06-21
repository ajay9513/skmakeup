import { Container, Section, SectionHeader } from '@/components/shared/section';
import { FadeIn } from '@/components/shared/motion';
import { CloudinaryImg } from '@/components/media/cloudinary-image';
import { SeoHead } from '@/components/seo/seo-head';
import { JsonLd } from '@/components/seo/json-ld';
import { usePageContent, useSeo, useSiteSettings, useTeamMembers } from '@/hooks/use-public-api';
import { getContentText } from '@/lib/api';

export function AboutPage() {
  const { data: contentData } = usePageContent('about');
  const { data: seo } = useSeo('about');
  const { data: settings } = useSiteSettings();
  const { data: team } = useTeamMembers();

  const content = contentData?.content ?? {};
  const headline = getContentText(content, 'about.intro.headline');
  const story = getContentText(content, 'about.intro.story');
  const mission = getContentText(content, 'about.mission.body');
  const experience = getContentText(content, 'about.experience.body');
  const awards = getContentText(content, 'about.awards.body');

  return (
    <>
      <SeoHead page="about" seo={seo} />
      <JsonLd settings={settings} type="WebPage" data={{ name: headline || 'About' }} />

      <Section className="bg-charcoal pt-8">
        <Container className="py-16 text-center md:py-24">
          {headline && <h1 className="luxury-heading text-4xl text-ivory md:text-6xl">{headline}</h1>}
          {settings?.tagline && <p className="mt-4 text-gold">{settings.tagline}</p>}
        </Container>
      </Section>

      {story && (
        <Section>
          <Container>
            <div className="mx-auto max-w-3xl">
              <SectionHeader eyebrow="Our Story" title="The Art of Beauty" align="left" />
              <FadeIn>
                <div className="prose prose-lg text-charcoal/80">
                  <p className="whitespace-pre-line leading-relaxed">{story}</p>
                </div>
              </FadeIn>
            </div>
          </Container>
        </Section>
      )}

      {experience && (
        <Section className="bg-white">
          <Container>
            <SectionHeader eyebrow="Experience" title="A Legacy of Excellence" />
            <FadeIn>
              <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-charcoal/70 whitespace-pre-line">{experience}</p>
            </FadeIn>
          </Container>
        </Section>
      )}

      {awards && (
        <Section>
          <Container>
            <SectionHeader eyebrow="Recognition" title="Awards & Accolades" />
            <FadeIn>
              <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-charcoal/70 whitespace-pre-line">{awards}</p>
            </FadeIn>
          </Container>
        </Section>
      )}

      {mission && (
        <Section dark>
          <Container>
            <SectionHeader eyebrow="Mission" title="Our Promise" light />
            <FadeIn>
              <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-ivory/70 whitespace-pre-line">{mission}</p>
            </FadeIn>
          </Container>
        </Section>
      )}

      {(team?.length ?? 0) > 0 && (
        <Section>
          <Container>
            <SectionHeader eyebrow="Team" title="The Artists Behind SK" />
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {team?.map((member, i) => (
                <FadeIn key={member._id} delay={i * 0.1}>
                  <CloudinaryImg image={member.profileImage} preset="gallery" className="aspect-[3/4] mb-4" />
                  <h3 className="font-serif text-2xl">{member.name}</h3>
                  <p className="text-sm text-gold">{member.designation}</p>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{member.description}</p>
                </FadeIn>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
