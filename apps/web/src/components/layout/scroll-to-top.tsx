import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Smooth scroll to top on every route change (navbar + footer links). */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}
