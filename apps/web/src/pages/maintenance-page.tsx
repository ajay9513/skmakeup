import { Container, Section } from '@/components/shared/section';
import { SeoHead } from '@/components/seo/seo-head';

export function MaintenancePage() {
  return (
    <Section className="min-h-screen bg-charcoal">
      <Container className="flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <SeoHead page="maintenance" title="Maintenance | SK Makeup Artist" noIndex />
        <p className="luxury-subheading text-gold">We&apos;ll Be Back Soon</p>
        <h1 className="mt-4 font-serif text-4xl text-ivory md:text-5xl">Site Under Maintenance</h1>
        <p className="mt-4 max-w-md text-ivory/60">
          We are making improvements to serve you better. Please check back shortly.
        </p>
      </Container>
    </Section>
  );
}
