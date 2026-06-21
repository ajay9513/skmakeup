import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './header';
import { Footer } from './footer';
import { StickyCta } from '@/components/conversion/sticky-cta';
import { FloatingContactButtons } from '@/components/conversion/floating-contact';
import { ScrollToTop } from '@/components/layout/scroll-to-top';
import { BrandHead } from '@/components/seo/brand-head';
import { Analytics } from '@/components/seo/analytics';
import { useSiteSettings } from '@/hooks/use-public-api';
import { MaintenancePage } from '@/pages/maintenance-page';
import { useEffect } from 'react';

export function Layout() {
  const location = useLocation();
  const { data: settings, isLoading } = useSiteSettings();

  useEffect(() => {
    const colors = settings?.brandColors;
    if (!colors) return;
    const root = document.documentElement;
    if (colors.charcoal) root.style.setProperty('--brand-charcoal', colors.charcoal);
    if (colors.gold) root.style.setProperty('--brand-gold', colors.gold);
    if (colors.ivory) root.style.setProperty('--brand-ivory', colors.ivory);
  }, [settings?.brandColors]);

  if (!isLoading && settings?.maintenanceMode) {
    return (
      <>
        <Analytics />
        <MaintenancePage />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Analytics />
      <BrandHead />
      <ScrollToTop />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-gold focus:px-4 focus:py-2 focus:text-charcoal">
        Skip to main content
      </a>
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          id="main-content"
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 pt-16 md:pt-20"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <StickyCta />
      <FloatingContactButtons />
    </div>
  );
}
