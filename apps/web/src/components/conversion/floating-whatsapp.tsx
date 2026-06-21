import { MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-public-api';
import { getEnv } from '@/lib/utils';

export function FloatingWhatsapp() {
  const { data: settings } = useSiteSettings();
  const conversion = settings?.conversionSettings;

  if (conversion?.floatingWhatsappEnabled === false) return null;

  const number = settings?.contactDetails?.whatsappNumber || getEnv('VITE_WHATSAPP_NUMBER');
  if (!number) return null;

  const clean = number.replace(/\D/g, '');

  return (
    <a
      href={`https://wa.me/${clean}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-editorial transition hover:scale-105 hover:shadow-gold md:bottom-6"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
