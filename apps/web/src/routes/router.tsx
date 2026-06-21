import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { Skeleton } from '@/components/ui/skeleton';

const HomePage = lazy(() => import('@/pages/home-page').then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('@/pages/about-page').then((m) => ({ default: m.AboutPage })));
const ServicesPage = lazy(() => import('@/pages/services-page').then((m) => ({ default: m.ServicesPage })));
const ServiceDetailPage = lazy(() => import('@/pages/service-detail-page').then((m) => ({ default: m.ServiceDetailPage })));
const PortfolioPage = lazy(() => import('@/pages/portfolio-page').then((m) => ({ default: m.PortfolioPage })));
const PortfolioDetailPage = lazy(() => import('@/pages/portfolio-detail-page').then((m) => ({ default: m.PortfolioDetailPage })));
const GalleryPage = lazy(() => import('@/pages/gallery-page').then((m) => ({ default: m.GalleryPage })));
const TestimonialsPage = lazy(() => import('@/pages/testimonials-page').then((m) => ({ default: m.TestimonialsPage })));
const BookingPage = lazy(() => import('@/pages/booking-page').then((m) => ({ default: m.BookingPage })));
const ContactPage = lazy(() => import('@/pages/contact-page').then((m) => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import('@/pages/not-found-page').then((m) => ({ default: m.NotFoundPage })));

function PageLoader() {
  return (
    <div className="container-luxury py-24 space-y-4">
      <Skeleton className="h-12 w-1/2" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: withSuspense(HomePage) },
      { path: 'about', element: withSuspense(AboutPage) },
      { path: 'services', element: withSuspense(ServicesPage) },
      { path: 'services/:slug', element: withSuspense(ServiceDetailPage) },
      { path: 'portfolio', element: withSuspense(PortfolioPage) },
      { path: 'portfolio/:slug', element: withSuspense(PortfolioDetailPage) },
      { path: 'gallery', element: withSuspense(GalleryPage) },
      { path: 'testimonials', element: withSuspense(TestimonialsPage) },
      { path: 'book', element: withSuspense(BookingPage) },
      { path: 'contact', element: withSuspense(ContactPage) },
      { path: '*', element: withSuspense(NotFoundPage) },
    ],
  },
]);
