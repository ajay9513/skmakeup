import { useMemo } from 'react';
import { usePageContent } from '@/hooks/use-public-api';
import { getContentText } from '@/lib/api';

export interface NavLink {
  to: string;
  label: string;
  external?: boolean;
}

const DEFAULT_LINKS: NavLink[] = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/contact', label: 'Contact' },
];

export function useNavigationLinks(): NavLink[] {
  const { data } = usePageContent('global');

  return useMemo(() => {
    const content = data?.content ?? {};
    const links: NavLink[] = [];

    for (let n = 1; n <= 7; n += 1) {
      const href = getContentText(content, `global.nav.link${n}.href`);
      const label = getContentText(content, `global.nav.link${n}.label`);
      if (!href || !label) continue;
      links.push({
        to: href,
        label,
        external: /^https?:\/\//i.test(href),
      });
    }

    return links.length > 0 ? links : DEFAULT_LINKS;
  }, [data]);
}
