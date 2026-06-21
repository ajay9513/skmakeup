import { Link } from 'react-router-dom';
import { FadeIn } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks/use-public-api';

interface ConversionBannerProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  className?: string;
}

export function ConversionBanner({ title = 'Ready for Your Transformation?', description = 'Book a luxury makeup session tailored to you.', ctaLabel, className }: ConversionBannerProps) {
  const { data: settings } = useSiteSettings();
  const conversion = settings?.conversionSettings;
  const label = ctaLabel || conversion?.stickyCtaLabel || 'Book Your Session';

  return (
    <FadeIn className={className}>
      <div className="relative overflow-hidden bg-charcoal px-6 py-12 text-center md:py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/5" />
        <div className="relative">
          <h2 className="font-serif text-2xl text-ivory md:text-3xl">{title}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ivory/70 md:text-base">{description}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/book"><Button size="lg">{label}</Button></Link>
            <Link to="/contact"><Button variant="outline" size="lg" className="border-ivory/30 text-ivory hover:bg-ivory/10">Contact Us</Button></Link>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

export function PortfolioCta() {
  const { data: settings } = useSiteSettings();
  const conversion = settings?.conversionSettings;

  if (conversion?.portfolioCtaEnabled === false) return null;

  const label = conversion?.portfolioCtaLabel || 'Book This Look';

  return (
    <ConversionBanner
      title="Love This Look?"
      description="Let us create a bespoke makeup experience for your special day."
      ctaLabel={label}
      className="mt-16"
    />
  );
}
