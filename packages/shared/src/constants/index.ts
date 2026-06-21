export const ROLES = ['super_admin', 'admin', 'editor', 'viewer'] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ['active', 'inactive', 'suspended'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'rejected',
  'cancelled',
  'completed',
  'rescheduled',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const LEAD_STAGES = [
  'New',
  'Contacted',
  'Interested',
  'Negotiation',
  'Converted',
  'Lost',
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const PORTFOLIO_CATEGORIES = [
  'Bridal',
  'Reception',
  'Engagement',
  'Celebrity',
  'Fashion',
  'Editorial',
  'HD Makeup',
  'Airbrush Makeup',
] as const;
export type PortfolioCategory = (typeof PORTFOLIO_CATEGORIES)[number];

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

export const PERMISSIONS = {
  VIEW_DASHBOARD: ['super_admin', 'admin', 'editor', 'viewer'],
  MANAGE_CONTENT: ['super_admin', 'admin', 'editor'],
  PUBLISH_CONTENT: ['super_admin', 'admin', 'editor'],
  DELETE_CONTENT: ['super_admin', 'admin'],
  MANAGE_BOOKINGS: ['super_admin', 'admin', 'editor'],
  MANAGE_LEADS: ['super_admin', 'admin', 'editor'],
  MANAGE_SETTINGS: ['super_admin', 'admin'],
  MANAGE_USERS: ['super_admin'],
  MANAGE_SEO: ['super_admin', 'admin', 'editor'],
  UPLOAD_MEDIA: ['super_admin', 'admin', 'editor'],
  DELETE_MEDIA: ['super_admin', 'admin'],
  VIEW_AUDIT_LOGS: ['super_admin', 'admin'],
  MANAGE_AVAILABILITY: ['super_admin', 'admin', 'editor'],
} as const satisfies Record<string, readonly Role[]>;

export const REFRESH_TOKEN_COOKIE = 'sk_refresh_token';

export const API_PREFIX = '/api/v1';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 50,
} as const;
