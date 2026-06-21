import mongoose, { Document, Schema } from 'mongoose';
import {
  CloudinaryImageSchema,
  SeoSnapshotSchema,
  SocialLinksSchema,
  BusinessHoursDaySchema,
} from '../schemas/shared.schemas';

export interface ISiteSettingsDocument extends Document {
  isActive: boolean;
  siteName: string;
  tagline: string;
  logo: Record<string, unknown>;
  brandingSettings?: {
    logo?: Record<string, unknown>;
    darkLogo?: Record<string, unknown>;
    mobileLogo?: Record<string, unknown>;
    favicon?: Record<string, unknown>;
    appleTouchIcon?: Record<string, unknown>;
  };
  faviconNote: string;
  contactDetails: {
    email: string;
    phone: string;
    whatsappNumber: string;
    address: string;
    mapEmbedUrl?: string;
  };
  socialLinks: Record<string, unknown>;
  businessHours: Record<string, unknown>;
  analyticsIds: {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
  };
  seoDefaults: Record<string, unknown>;
  maintenanceMode: boolean;
  brandColors: {
    charcoal: string;
    gold: string;
    ivory: string;
  };
  bookingSettings: {
    minAdvanceDays: number;
    maxAdvanceDays: number;
    requirePhone: boolean;
    confirmationMessage?: string;
  };
  conversionSettings: {
    stickyCtaEnabled: boolean;
    stickyCtaLabel: string;
    stickyCtaHref: string;
    floatingWhatsappEnabled: boolean;
    floatingCallEnabled: boolean;
    portfolioCtaEnabled: boolean;
    portfolioCtaLabel: string;
  };
  cloudinarySettings: {
    quality: string;
    format: string;
  };
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettingsDocument>(
  {
    isActive: { type: Boolean, default: true },
    siteName: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    logo: { type: CloudinaryImageSchema, required: false },
    brandingSettings: {
      logo: { type: CloudinaryImageSchema },
      darkLogo: { type: CloudinaryImageSchema },
      mobileLogo: { type: CloudinaryImageSchema },
      favicon: { type: CloudinaryImageSchema },
      appleTouchIcon: { type: CloudinaryImageSchema },
    },
    faviconNote: { type: String, default: 'Managed via Admin → Settings → Branding' },
    contactDetails: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      whatsappNumber: { type: String, required: true },
      address: { type: String, required: true },
      mapEmbedUrl: { type: String },
    },
    socialLinks: { type: SocialLinksSchema, default: {} },
    businessHours: {
      monday: { type: BusinessHoursDaySchema },
      tuesday: { type: BusinessHoursDaySchema },
      wednesday: { type: BusinessHoursDaySchema },
      thursday: { type: BusinessHoursDaySchema },
      friday: { type: BusinessHoursDaySchema },
      saturday: { type: BusinessHoursDaySchema },
      sunday: { type: BusinessHoursDaySchema },
    },
    analyticsIds: {
      googleAnalyticsId: { type: String },
      googleTagManagerId: { type: String },
      facebookPixelId: { type: String },
    },
    seoDefaults: { type: SeoSnapshotSchema, default: {} },
    maintenanceMode: { type: Boolean, default: false },
    brandColors: {
      charcoal: { type: String, default: '#1A1A1A' },
      gold: { type: String, default: '#C9A962' },
      ivory: { type: String, default: '#FAF8F5' },
    },
    bookingSettings: {
      minAdvanceDays: { type: Number, default: 1 },
      maxAdvanceDays: { type: Number, default: 90 },
      requirePhone: { type: Boolean, default: true },
      confirmationMessage: { type: String },
    },
    conversionSettings: {
      stickyCtaEnabled: { type: Boolean, default: true },
      stickyCtaLabel: { type: String, default: 'Book Now' },
      stickyCtaHref: { type: String, default: '/book' },
      floatingWhatsappEnabled: { type: Boolean, default: true },
      floatingCallEnabled: { type: Boolean, default: true },
      portfolioCtaEnabled: { type: Boolean, default: true },
      portfolioCtaLabel: { type: String, default: 'Book This Look' },
    },
    cloudinarySettings: {
      quality: { type: String, default: 'auto:best' },
      format: { type: String, default: 'auto' },
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

SiteSettingsSchema.index(
  { isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

export const SiteSettingsModel = mongoose.model<ISiteSettingsDocument>(
  'SiteSettings',
  SiteSettingsSchema,
);
