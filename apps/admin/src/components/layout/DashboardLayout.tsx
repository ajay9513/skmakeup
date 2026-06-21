import { useState } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '@/lib/utils';

interface RouteHandle {
  title?: string;
  breadcrumbs?: { label: string }[];
}

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const matches = useMatches();
  const handle = matches[matches.length - 1]?.handle as RouteHandle | undefined;
  const title = handle?.title ?? 'Dashboard';
  const breadcrumbs = handle?.breadcrumbs;

  return (
    <div className="min-h-screen bg-ivory">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-charcoal/50 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed(!collapsed)}
        onNavigate={() => setMobileOpen(false)}
      />

      <Topbar
        title={title}
        breadcrumbs={breadcrumbs}
        sidebarCollapsed={collapsed}
        onMenuClick={() => setMobileOpen(true)}
      />

      <main
        className={cn(
          'min-h-screen pt-16 transition-all duration-300',
          'pl-0 lg:pl-64',
          collapsed && 'lg:pl-[72px]',
        )}
      >
        <div className="p-4 sm:p-6">
          <button
            type="button"
            className="mb-4 inline-flex items-center gap-2 rounded-lg border border-charcoal/10 bg-white px-3 py-2 text-sm text-charcoal shadow-sm lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
