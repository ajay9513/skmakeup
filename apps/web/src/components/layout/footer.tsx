import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone } from 'lucide-react';
import { useSiteSettings, usePageContent } from '@/hooks/use-public-api';
import { SiteLogo } from '@/components/layout/site-logo';
import { getContentText } from '@/lib/api';
import { scrollToTop } from '@/lib/scroll-nav';

export function Footer() {
  const { data: settings } = useSiteSettings();
  const { data: globalContent } = usePageContent('global');

  const content = globalContent?.content ?? {};
  const tagline = getContentText(content, 'global.footer.tagline') || settings?.tagline;
  const copyright = getContentText(content, 'global.footer.copyright');
  const social = settings?.socialLinks ?? {};

  const footerLinks = [1, 2, 3, 4]
    .map((n) => ({
      label: getContentText(content, `global.footer.link${n}.label`),
      href: getContentText(content, `global.footer.link${n}.href`),
    }))
    .filter((l) => l.label && l.href);

  return (
    <footer className="border-t border-charcoal/10 bg-charcoal pb-20 text-ivory md:pb-8">
      <div className="container-luxury section-padding pb-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <SiteLogo variant="dark" className="font-serif text-2xl" />
            {tagline && <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/60">{tagline}</p>}
          </div>

          <div>
            <h3 className="luxury-subheading mb-4 text-gold-light">Explore</h3>
            <ul className="space-y-2 text-sm text-ivory/70">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} onClick={scrollToTop} className="transition hover:text-gold">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="luxury-subheading mb-4 text-gold-light">Contact</h3>
            <ul className="space-y-3 text-sm text-ivory/70">
              {settings?.contactDetails?.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gold" />
                  <a href={`tel:${settings.contactDetails.phone}`}>{settings.contactDetails.phone}</a>
                </li>
              )}
              {settings?.contactDetails?.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gold" />
                  <a href={`mailto:${settings.contactDetails.email}`}>{settings.contactDetails.email}</a>
                </li>
              )}
            </ul>
            <div className="mt-4 flex gap-3">
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-ivory/60 hover:text-gold">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-ivory/60 hover:text-gold">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-ivory/10 pt-8 text-center text-xs text-ivory/40">
          {copyright || `© ${new Date().getFullYear()} ${settings?.siteName}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}
