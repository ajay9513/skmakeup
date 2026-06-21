import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Image, Briefcase, Camera, Images, Calendar,
  MessageSquare, Users, FileText, Search, Settings, ChevronLeft, Sparkles, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { hasPermission } from '@/lib/rbac';
import { Role } from '@sk-makeup/shared';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, permission: 'VIEW_DASHBOARD' as const },
  { to: '/media', label: 'Media Library', icon: Image, permission: 'UPLOAD_MEDIA' as const },
  { to: '/services', label: 'Services', icon: Briefcase, permission: 'VIEW_DASHBOARD' as const },
  { to: '/portfolio', label: 'Portfolio', icon: Camera, permission: 'VIEW_DASHBOARD' as const },
  { to: '/gallery', label: 'Gallery', icon: Images, permission: 'VIEW_DASHBOARD' as const },
  { to: '/bookings', label: 'Bookings', icon: Calendar, permission: 'MANAGE_BOOKINGS' as const },
  { to: '/testimonials', label: 'Testimonials', icon: MessageSquare, permission: 'VIEW_DASHBOARD' as const },
  { to: '/team', label: 'Team Members', icon: Users, permission: 'VIEW_DASHBOARD' as const },
  { to: '/content', label: 'Website Content', icon: FileText, permission: 'VIEW_DASHBOARD' as const },
  { to: '/seo', label: 'SEO', icon: Search, permission: 'MANAGE_SEO' as const },
  { to: '/settings', label: 'Settings', icon: Settings, permission: 'MANAGE_SETTINGS' as const },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onToggle, onNavigate }: SidebarProps) {
  const location = useLocation();
  const role = useAppSelector((s) => s.auth.user?.role) as Role | undefined;

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-charcoal/95 text-ivory shadow-editorial backdrop-blur-xl transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      <div className="flex h-16 items-center justify-between gap-3 border-b border-white/10 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/20">
            <Sparkles className="h-5 w-5 text-gold" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-serif text-sm font-semibold leading-tight">SK Makeup</p>
              <p className="text-[10px] uppercase tracking-widest text-ivory/50">Admin Studio</p>
            </div>
          )}
        </div>
        <button
          type="button"
          className="rounded-lg p-1 text-ivory/60 hover:bg-white/10 lg:hidden"
          onClick={onNavigate}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          if (!hasPermission(role, item.permission)) return null;
          const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
                active ? 'bg-gold/15 text-gold-light' : 'text-ivory/70 hover:bg-white/5 hover:text-ivory',
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onToggle}
        className="hidden h-12 items-center justify-center border-t border-white/10 text-ivory/50 hover:text-ivory lg:flex"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft className={cn('h-5 w-5 transition', collapsed && 'rotate-180')} />
      </button>
    </aside>
  );
}
