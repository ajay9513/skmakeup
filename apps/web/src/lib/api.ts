import type { CloudinaryImageInput, ListQueryInput } from '@sk-makeup/shared';
import { api, unwrap, unwrapPaginated } from './axios';
import type {
  AvailabilitySlots,
  GalleryAlbum,
  Package,
  PageContent,
  PortfolioItem,
  SeoData,
  Service,
  SiteSettings,
  TeamMember,
  Testimonial,
} from './types';

export const publicApi = {
  getSiteSettings: () => api.get('/public/site-settings').then(unwrap<SiteSettings>),

  getPageContent: (page: string) => api.get(`/public/content/${page}`).then(unwrap<PageContent>),

  getSeo: (page: string) => api.get(`/public/seo/${page}`).then(unwrap<SeoData>),

  getServices: (params?: Partial<ListQueryInput>) =>
    api.get('/public/services', { params }).then(unwrapPaginated<Service>),

  getService: (slug: string) => api.get(`/public/services/${slug}`).then(unwrap<Service>),

  getPackages: () => api.get('/public/packages').then(unwrap<Package[]>),

  getPortfolio: (params?: Partial<ListQueryInput>) =>
    api.get('/public/portfolio', { params }).then(unwrapPaginated<PortfolioItem>),

  getPortfolioItem: (slug: string) =>
    api
      .get(`/public/portfolio/${slug}`)
      .then(unwrap<{ item: PortfolioItem; related: PortfolioItem[] }>),

  getPortfolioPreview: (token: string) =>
    api.get(`/public/portfolio/preview/${token}`).then(unwrap<{ item: PortfolioItem; preview: boolean }>),

  getGallery: (params?: Partial<ListQueryInput>) =>
    api.get('/public/gallery', { params }).then(unwrapPaginated<GalleryAlbum>),

  getTestimonials: () => api.get('/public/testimonials').then(unwrap<Testimonial[]>),

  getTeamMembers: () => api.get('/public/team-members').then(unwrap<TeamMember[]>),

  getAvailableSlots: (date: string) =>
    api.get('/public/availability/slots', { params: { date } }).then(unwrap<AvailabilitySlots>),

  submitBooking: (data: Record<string, unknown>) =>
    api.post('/public/bookings', data).then(unwrap<{ bookingNumber: string; id: string }>),

  submitContact: (data: Record<string, unknown>) =>
    api.post('/public/contact', data).then(unwrap<{ id: string }>),
};

export function getContentText(content: Record<string, unknown>, key: string): string {
  const value = content[key];
  return typeof value === 'string' ? value : '';
}

export function getContentImage(content: Record<string, unknown>, key: string): CloudinaryImageInput | undefined {
  const value = content[key];
  if (value && typeof value === 'object' && 'publicId' in (value as object)) {
    return value as CloudinaryImageInput;
  }
  return undefined;
}

export function getStatItems(content: Record<string, unknown>, prefix: string) {
  const stats: { label: string; value: string }[] = [];
  const keys = Object.keys(content).filter((k) => k.startsWith(prefix));
  for (const key of keys) {
    const suffix = key.replace(prefix, '');
    const value = getContentText(content, key);
    if (value) {
      stats.push({ label: suffix.replace(/([A-Z])/g, ' $1').trim(), value });
    }
  }
  return stats;
}
