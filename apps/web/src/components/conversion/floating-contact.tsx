import { MessageCircle, Phone, CalendarHeart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/use-public-api';
import { scrollToTop } from '@/lib/scroll-nav';

function cleanPhone(number: string) {
  return number.replace(/[^\d+]/g, '').replace(/^\+/, '');
}

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg border border-white/10 bg-charcoal/80 px-3 py-1.5 text-xs text-ivory shadow-luxury backdrop-blur-md group-hover:block md:opacity-0 md:transition md:group-hover:opacity-100">
      {label}
    </span>
  );
}

export function FloatingContactButtons() {
  const { data: settings } = useSiteSettings();
  const conversion = settings?.conversionSettings;
  const phone = settings?.contactDetails?.phone;
  const whatsapp = settings?.contactDetails?.whatsappNumber;

  const showWhatsapp = conversion?.floatingWhatsappEnabled !== false && Boolean(whatsapp);
  const showCall = conversion?.floatingCallEnabled !== false && Boolean(phone);
  const showBook = conversion?.stickyCtaEnabled !== false;

  if (!showWhatsapp && !showCall && !showBook) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-3 md:bottom-6">
      {showBook && (
        <Link
          to="/book"
          onClick={scrollToTop}
          className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-rosegold/30 bg-gradient-to-br from-rosegold via-rosegold-light to-rosegold text-white shadow-luxury backdrop-blur-md transition hover:scale-105 hover:shadow-gold"
          aria-label="Book consultation"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-rosegold/20" aria-hidden />
          <Tooltip label="Book Consultation" />
          <CalendarHeart className="relative h-6 w-6 drop-shadow-sm" />
        </Link>
      )}
      {showCall && (
        <a
          href={`tel:${phone!.replace(/\s/g, '')}`}
          className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-gold/30 bg-gradient-to-br from-gold via-gold-light to-gold text-charcoal-dark shadow-gold backdrop-blur-md transition hover:scale-105 hover:shadow-[0_8px_32px_rgba(212,175,55,0.55)]"
          aria-label="Call us"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-gold/25" aria-hidden />
          <span className="absolute inset-0 bg-white/20 opacity-0 transition group-hover:opacity-100" aria-hidden />
          <Tooltip label="Call us" />
          <Phone className="relative h-6 w-6 drop-shadow-sm" />
        </a>
      )}
      {showWhatsapp && (
        <a
          href={`https://wa.me/${cleanPhone(whatsapp!)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-gradient-to-br from-[#25D366]/90 via-[#20bd5a]/90 to-[#128C7E]/90 text-white shadow-[0_4px_24px_rgba(37,211,102,0.4)] backdrop-blur-md transition hover:scale-105 hover:shadow-[0_8px_32px_rgba(37,211,102,0.55)]"
          aria-label="Chat on WhatsApp"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/25" aria-hidden />
          <span className="absolute inset-0 bg-white/15 opacity-0 transition group-hover:opacity-100" aria-hidden />
          <Tooltip label="WhatsApp" />
          <MessageCircle className="relative h-6 w-6 drop-shadow-sm" />
        </a>
      )}
    </div>
  );
}
