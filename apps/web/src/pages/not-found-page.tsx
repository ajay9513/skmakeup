import { Link } from 'react-router-dom';
import { Container, Section } from '@/components/shared/section';
import { Button } from '@/components/ui/button';
import { SeoHead } from '@/components/seo/seo-head';

export function NotFoundPage() {
  return (
    <>
      <SeoHead page="404" title="Page Not Found" noIndex />
      <Section>
        <Container className="py-32 text-center">
          <p className="luxury-subheading">404</p>
          <h1 className="mt-4 font-serif text-4xl">Page Not Found</h1>
          <p className="mt-4 text-charcoal/60">The page you are looking for does not exist.</p>
          <Link to="/" className="mt-8 inline-block">
            <Button>Return Home</Button>
          </Link>
        </Container>
      </Section>
    </>
  );
}
