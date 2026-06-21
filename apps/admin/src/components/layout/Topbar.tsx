import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, Menu } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { authApi } from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TopbarProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  sidebarCollapsed: boolean;
  onMenuClick?: () => void;
}

export function Topbar({ title, breadcrumbs, sidebarCollapsed, onMenuClick }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      dispatch(logout());
      queryClient.clear();
      navigate('/login');
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-charcoal-light/10 bg-white/80 px-4 backdrop-blur-md transition-all sm:px-6',
        'left-0 lg:left-64',
        sidebarCollapsed && 'lg:left-[72px]',
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-charcoal/70 hover:bg-ivory-dark lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-serif text-lg font-semibold text-charcoal sm:text-xl">{title}</h1>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mt-0.5 hidden items-center gap-1 text-xs text-charcoal/50 sm:flex">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.label} className="flex items-center gap-1">
                  {i > 0 && <span>/</span>}
                  <span className={i === breadcrumbs.length - 1 ? 'text-charcoal/80' : ''}>{crumb.label}</span>
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative hidden rounded-lg p-2 text-charcoal/60 hover:bg-ivory-dark hover:text-charcoal sm:block" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-ivory-dark sm:px-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15">
              <User className="h-4 w-4 text-gold-dark" />
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-charcoal">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs capitalize text-charcoal/50">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-charcoal/40" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-charcoal-light/10 bg-white py-1 shadow-luxury">
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
