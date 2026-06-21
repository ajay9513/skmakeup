import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute, GuestRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MediaLibraryPage } from '@/pages/MediaLibraryPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { PortfolioPage } from '@/pages/PortfolioPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { BookingsPage } from '@/pages/BookingsPage';
import { TestimonialsPage, TeamPage } from '@/pages/ContentPages';
import { CmsHubPage } from '@/pages/CmsHubPage';
import { SeoPage } from '@/pages/SeoPage';
import { SettingsCenterPage } from '@/pages/SettingsCenterPage';
import { PortfolioEditorPage } from '@/pages/PortfolioEditorPage';
import { ServiceEditorPage } from '@/pages/ServiceEditorPage';
import { GalleryEditorPage } from '@/pages/GalleryEditorPage';
import { TestimonialEditorPage } from '@/pages/TestimonialEditorPage';
import { TeamEditorPage } from '@/pages/TeamEditorPage';

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage />, handle: { title: 'Overview', breadcrumbs: [{ label: 'Dashboard' }] } },
          { path: 'media', element: <MediaLibraryPage />, handle: { title: 'Media Library', breadcrumbs: [{ label: 'Media Library' }] } },
          { path: 'services', element: <ServicesPage />, handle: { title: 'Services', breadcrumbs: [{ label: 'Services' }] } },
          { path: 'services/:id/edit', element: <ServiceEditorPage />, handle: { title: 'Edit Service', breadcrumbs: [{ label: 'Services', href: '/services' }, { label: 'Edit' }] } },
          { path: 'portfolio', element: <PortfolioPage />, handle: { title: 'Portfolio', breadcrumbs: [{ label: 'Portfolio' }] } },
          { path: 'portfolio/:id/edit', element: <PortfolioEditorPage />, handle: { title: 'Edit Portfolio', breadcrumbs: [{ label: 'Portfolio', href: '/portfolio' }, { label: 'Edit' }] } },
          { path: 'gallery', element: <GalleryPage />, handle: { title: 'Gallery', breadcrumbs: [{ label: 'Gallery' }] } },
          { path: 'gallery/:id/edit', element: <GalleryEditorPage />, handle: { title: 'Edit Gallery', breadcrumbs: [{ label: 'Gallery', href: '/gallery' }, { label: 'Edit' }] } },
          { path: 'bookings', element: <BookingsPage />, handle: { title: 'Bookings', breadcrumbs: [{ label: 'Bookings' }] } },
          { path: 'testimonials', element: <TestimonialsPage />, handle: { title: 'Testimonials', breadcrumbs: [{ label: 'Testimonials' }] } },
          { path: 'testimonials/:id/edit', element: <TestimonialEditorPage />, handle: { title: 'Edit Testimonial', breadcrumbs: [{ label: 'Testimonials', href: '/testimonials' }, { label: 'Edit' }] } },
          { path: 'team', element: <TeamPage />, handle: { title: 'Team Members', breadcrumbs: [{ label: 'Team' }] } },
          { path: 'team/:id/edit', element: <TeamEditorPage />, handle: { title: 'Edit Team Member', breadcrumbs: [{ label: 'Team', href: '/team' }, { label: 'Edit' }] } },
          { path: 'content', element: <CmsHubPage />, handle: { title: 'Website Content', breadcrumbs: [{ label: 'Content' }] } },
          { path: 'seo', element: <SeoPage />, handle: { title: 'SEO', breadcrumbs: [{ label: 'SEO' }] } },
          { path: 'settings', element: <SettingsCenterPage />, handle: { title: 'Settings', breadcrumbs: [{ label: 'Settings' }] } },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
