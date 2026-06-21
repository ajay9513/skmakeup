import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteSettings } from '@/hooks/use-public-api';

function CtaLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  const isExternal = /^(https?:\/\/|tel:|mailto:|wa\.me)/i.test(href);
  if (isExternal) {
    return (
      <a href={href} className={className} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return <Link to={href} className={className}>{children}</Link>;
}

export function StickyCta() {
  const { data: settings } = useSiteSettings();
  const conversion = settings?.conversionSettings;

  if (conversion?.stickyCtaEnabled === false) return null;

  const label = conversion?.stickyCtaLabel || 'Book Now';
  const href = conversion?.stickyCtaHref || '/book';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-gold/20 bg-charcoal/95 px-4 py-3 backdrop-blur-md md:hidden"
        role="region"
        aria-label="Quick booking"
      >
        <CtaLink
          href={href}
          className="flex w-full items-center justify-center bg-gold py-3 text-sm font-medium uppercase tracking-wider text-charcoal transition hover:bg-gold-light"
        >
          {label}
        </CtaLink>
      </motion.div>
    </AnimatePresence>
  );
}
