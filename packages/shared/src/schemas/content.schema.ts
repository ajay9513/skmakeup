import { z } from 'zod';
import { PORTFOLIO_CATEGORIES, BOOKING_STATUSES } from '../constants';
import { cloudinaryImageSchema, seoSnapshotSchema, objectIdSchema } from './common.schema';

export const createServiceSchema = z.object({
  title: z.string().trim().min(1).max(150),
  shortDescription: z.string().trim().min(1).max(300),
  fullDescription: z.string().min(1),
  featuredImage: cloudinaryImageSchema,
  galleryImages: z.array(cloudinaryImageSchema).default([]),
  category: z.enum(['bridal', 'reception', 'engagement', 'party', 'editorial', 'fashion', 'hd_makeup', 'airbrush', 'other']),
  duration: z.number().int().min(0),
  startingPrice: z.number().min(0),
  currency: z.string().default('USD'),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  seo: seoSnapshotSchema.optional(),
  displayOrder: z.number().int().default(0),
});

export const updateServiceSchema = createServiceSchema.partial();

export const createPortfolioSchema = z.object({
  title: z.string().trim().min(1).max(150),
  category: z.enum(PORTFOLIO_CATEGORIES),
  description: z.string().optional(),
  featuredImage: cloudinaryImageSchema,
  galleryImages: z.array(cloudinaryImageSchema).default([]),
  beforeImage: cloudinaryImageSchema.optional(),
  afterImage: cloudinaryImageSchema.optional(),
  tags: z.array(z.string()).default([]),
  serviceReference: objectIdSchema.optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  scheduledPublishAt: z.coerce.date().optional().nullable(),
  seo: seoSnapshotSchema.optional(),
  displayOrder: z.number().int().default(0),
});

export const updatePortfolioSchema = createPortfolioSchema.partial();

export const createGallerySchema = z.object({
  title: z.string().trim().min(1).max(150),
  category: z.enum([...PORTFOLIO_CATEGORIES, 'General']),
  description: z.string().optional(),
  images: z.array(cloudinaryImageSchema).default([]),
  displayOrder: z.number().int().default(0),
  featured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  seo: seoSnapshotSchema.optional(),
});

export const updateGallerySchema = createGallerySchema.partial();

export const reorderImagesSchema = z.object({
  images: z.array(cloudinaryImageSchema).min(1),
});

export const createTestimonialSchema = z.object({
  clientName: z.string().trim().min(1),
  clientRole: z.string().optional(),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  avatar: cloudinaryImageSchema.optional(),
  serviceReference: objectIdSchema.optional(),
  teamMemberReference: objectIdSchema.optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

export const createTeamMemberSchema = z.object({
  name: z.string().trim().min(1),
  designation: z.string().trim().min(1),
  profileImage: cloudinaryImageSchema,
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  socialLinks: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
    linkedin: z.string().optional(),
    whatsapp: z.string().optional(),
  }).optional(),
  specialties: z.array(z.string()).default([]),
  experienceYears: z.number().int().min(0).optional(),
  displayOrder: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  seo: seoSnapshotSchema.optional(),
});

export const updateTeamMemberSchema = createTeamMemberSchema.partial();

export const createWebsiteContentSchema = z.object({
  key: z.string().trim().min(1),
  page: z.enum(['homepage', 'about', 'contact', 'services', 'portfolio', 'packages', 'book', 'team', 'global']),
  section: z.enum(['hero', 'footer', 'business_info', 'intro', 'cta', 'features', 'stats', 'banner', 'legal', 'custom']),
  contentType: z.enum(['text', 'richtext', 'markdown', 'image', 'image_array', 'json', 'html']),
  label: z.string().trim().min(1),
  value: z.unknown(),
  image: cloudinaryImageSchema.optional(),
  locale: z.string().default('en'),
  isVisible: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
  metadata: z.record(z.unknown()).optional(),
});

export const updateWebsiteContentSchema = createWebsiteContentSchema.partial();

export const createSeoSchema = z.object({
  scope: z.enum(['global', 'page', 'entity']),
  page: z.enum(['homepage', 'about', 'contact', 'services', 'portfolio', 'packages', 'book', 'team', 'gallery']).optional(),
  slug: z.string().optional(),
  entityType: z.enum(['service', 'package', 'portfolio', 'gallery', 'team_member', 'testimonial']).optional(),
  entityId: objectIdSchema.optional(),
  metaTitle: z.string().max(70),
  metaDescription: z.string().max(160),
  keywords: z.array(z.string()).default([]),
  canonicalUrl: z.string().url().optional(),
  robots: z.string().default('index,follow'),
  openGraph: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: cloudinaryImageSchema.optional(),
    type: z.string().default('website'),
    url: z.string().optional(),
  }).optional(),
  structuredData: z.record(z.unknown()).default({}),
  isActive: z.boolean().default(true),
});

export const updateSeoSchema = createSeoSchema.partial();

export const updateSiteSettingsSchema = z.object({
  siteName: z.string().trim().min(1).optional(),
  tagline: z.string().trim().min(1).optional(),
  logo: cloudinaryImageSchema.optional(),
  brandingSettings: z.object({
    logo: cloudinaryImageSchema.optional(),
    darkLogo: cloudinaryImageSchema.optional(),
    mobileLogo: cloudinaryImageSchema.optional(),
    favicon: cloudinaryImageSchema.optional(),
    appleTouchIcon: cloudinaryImageSchema.optional(),
  }).optional(),
  contactDetails: z.object({
    email: z.string().email(),
    phone: z.string(),
    whatsappNumber: z.string(),
    address: z.string(),
    mapEmbedUrl: z.string().optional(),
  }).optional(),
  socialLinks: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
    linkedin: z.string().optional(),
    whatsapp: z.string().optional(),
  }).optional(),
  businessHours: z.record(z.object({
    open: z.string().optional(),
    close: z.string().optional(),
    closed: z.boolean().optional(),
  })).optional(),
  analyticsIds: z.object({
    googleAnalyticsId: z.string().optional(),
    googleTagManagerId: z.string().optional(),
    facebookPixelId: z.string().optional(),
  }).optional(),
  seoDefaults: seoSnapshotSchema.optional(),
  maintenanceMode: z.boolean().optional(),
  brandColors: z.object({
    charcoal: z.string().optional(),
    gold: z.string().optional(),
    ivory: z.string().optional(),
  }).optional(),
  bookingSettings: z.object({
    minAdvanceDays: z.number().int().min(0).optional(),
    maxAdvanceDays: z.number().int().min(1).optional(),
    requirePhone: z.boolean().optional(),
    confirmationMessage: z.string().optional(),
  }).optional(),
  conversionSettings: z.object({
    stickyCtaEnabled: z.boolean().optional(),
    stickyCtaLabel: z.string().optional(),
    stickyCtaHref: z.string().optional(),
    floatingWhatsappEnabled: z.boolean().optional(),
    floatingCallEnabled: z.boolean().optional(),
    portfolioCtaEnabled: z.boolean().optional(),
    portfolioCtaLabel: z.string().optional(),
  }).optional(),
  cloudinarySettings: z.object({
    quality: z.string().optional(),
    format: z.string().optional(),
  }).optional(),
});

export const timeSlotSchema = z.object({
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  maxBookings: z.number().int().min(1).default(1),
});

export const weeklyAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  slots: z.array(timeSlotSchema).min(1),
});

export const blockedDateSchema = z.object({
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  reason: z.string().optional(),
  allDay: z.boolean().default(true),
  slots: z.array(timeSlotSchema).optional(),
});

export const slotCheckSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
  adminNotes: z.string().optional(),
  bookingDate: z.string().optional(),
  bookingTime: z.string().optional(),
});
