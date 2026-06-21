import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SiteLogo } from '@/components/layout/site-logo';
import { scrollToTop } from '@/lib/scroll-nav';
import { useNavigationLinks } from '@/hooks/use-navigation';

export function Header() {
  const [open, setOpen] = useState(false);
  const navLinks = useNavigationLinks();

  const renderLink = (link: (typeof navLinks)[0], mobile = false) => {
    const className = mobile
      ? ({ isActive }: { isActive: boolean }) =>
          cn('px-2 py-3 text-sm uppercase tracking-wider', isActive ? 'text-gold' : 'text-ivory/80')
      : ({ isActive }: { isActive: boolean }) =>
          cn(
            'text-xs font-medium uppercase tracking-luxury transition-colors',
            isActive ? 'text-gold' : 'text-ivory/70 hover:text-ivory',
          );

    const onClick = () => {
      scrollToTop();
      if (mobile) setOpen(false);
    };

    if (link.external) {
      return (
        <a
          key={link.to}
          href={link.to}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className={mobile ? 'px-2 py-3 text-sm uppercase tracking-wider text-ivory/80' : 'text-xs font-medium uppercase tracking-luxury text-ivory/70 hover:text-ivory'}
        >
          {link.label}
        </a>
      );
    }

    return (
      <NavLink
        key={link.to}
        to={link.to}
        end={link.to === '/'}
        onClick={onClick}
        className={className}
      >
        {link.label}
      </NavLink>
    );
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-charcoal/90 backdrop-blur-md">
      <div className="container-luxury flex h-16 items-center justify-between md:h-20">
        <SiteLogo variant="light" />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => renderLink(link))}
        </nav>

        <div className="hidden lg:block">
          <Link to="/book" onClick={scrollToTop}>
            <Button size="sm">Book Now</Button>
          </Link>
        </div>

        <button
          type="button"
          className="text-ivory lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-charcoal lg:hidden" aria-label="Mobile navigation">
          <div className="container-luxury flex flex-col gap-1 py-4">
            {navLinks.map((link) => renderLink(link, true))}
            <Link to="/book" onClick={() => { scrollToTop(); setOpen(false); }} className="mt-2">
              <Button className="w-full">Book Now</Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
