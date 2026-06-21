export interface CloudinaryImage {
  publicId: string;
  secureUrl: string;
  url: string;
  width: number;
  height: number;
  format: string;
  alt?: string;
  caption?: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logo?: CloudinaryImage;
  brandingSettings?: {
    logo?: CloudinaryImage;
    darkLogo?: CloudinaryImage;
    mobileLogo?: CloudinaryImage;
    favicon?: CloudinaryImage;
    appleTouchIcon?: CloudinaryImage;
  };
  contactDetails: {
    email: string;
    phone: string;
    whatsappNumber: string;
    address: string;
    mapEmbedUrl?: string;
  };
  socialLinks: Record<string, string>;
  businessHours: Record<string, { open?: string; close?: string; closed?: boolean }>;
  seoDefaults?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  brandColors?: {
    charcoal?: string;
    gold?: string;
    ivory?: string;
  };
  bookingSettings?: {
    minAdvanceDays?: number;
    maxAdvanceDays?: number;
    requirePhone?: boolean;
    confirmationMessage?: string;
  };
  conversionSettings?: {
    stickyCtaEnabled?: boolean;
    stickyCtaLabel?: string;
    stickyCtaHref?: string;
    floatingWhatsappEnabled?: boolean;
    floatingCallEnabled?: boolean;
    portfolioCtaEnabled?: boolean;
    portfolioCtaLabel?: string;
  };
  maintenanceMode?: boolean;
  analyticsIds?: {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
  };
}

export interface PageContent {
  page: string;
  content: Record<string, unknown>;
}

export interface Service {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  startingPrice: number;
  currency: string;
  duration: number;
  featuredImage: CloudinaryImage;
  galleryImages?: CloudinaryImage[];
  isFeatured: boolean;
}

export interface Package {
  _id: string;
  title: string;
  slug: string;
  description: string;
  packagePrice: number;
  compareAtPrice?: number;
  currency: string;
  includedServices: { _id: string; title: string; slug: string; startingPrice: number }[];
  featuredImage: CloudinaryImage;
  isFeatured: boolean;
}

export interface PortfolioItem {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  featuredImage: CloudinaryImage;
  galleryImages: CloudinaryImage[];
  beforeImage?: CloudinaryImage;
  afterImage?: CloudinaryImage;
  tags: string[];
  featured: boolean;
  viewCount: number;
}

export interface GalleryAlbum {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  category: string;
  images: CloudinaryImage[];
  featured: boolean;
}

export interface Testimonial {
  _id: string;
  clientName: string;
  clientRole?: string;
  content: string;
  rating: number;
  avatar?: CloudinaryImage;
  isFeatured: boolean;
}

export interface TeamMember {
  _id: string;
  name: string;
  slug: string;
  designation: string;
  description: string;
  shortDescription?: string;
  profileImage: CloudinaryImage;
  specialties?: string[];
  experienceYears?: number;
  isFeatured: boolean;
}

export interface SeoData {
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    openGraph?: {
      title?: string;
      description?: string;
      image?: CloudinaryImage;
      type?: string;
    };
    structuredData?: Record<string, unknown>;
  };
  defaults?: { metaTitle?: string; metaDescription?: string };
  siteName?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailabilitySlots {
  date: string;
  slots: TimeSlot[];
}
