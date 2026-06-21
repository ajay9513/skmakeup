import {
  UserRepository,
  RefreshTokenRepository,
  AuditLogRepository,
  PasswordResetTokenRepository,
  CounterRepository,
} from './infrastructure/database/repositories';
import { MediaAssetRepository } from './infrastructure/database/repositories/media-asset.repository';
import { JwtService } from './infrastructure/auth/jwt.service';
import { EmailService } from './infrastructure/email/email.service';
import { CloudinaryService } from './infrastructure/cloudinary/cloudinary.service';
import { AuthService } from './application/services/auth.service';
import { MediaService } from './application/services/media.service';
import { PortfolioService } from './application/services/portfolio.service';
import {
  ServiceCatalogService,
  GalleryService,
  TestimonialService,
  TeamMemberService,
  WebsiteContentService,
  SeoService,
  SiteSettingsService,
  BookingService,
  AvailabilityService,
  DashboardService,
} from './application/services/content.services';
import { PublicService } from './application/services/public.service';
import { SitemapService } from './application/services/sitemap.service';
import { AuditHelper } from './application/helpers/audit.helper';

const userRepository = new UserRepository();
const refreshTokenRepository = new RefreshTokenRepository();
const auditLogRepository = new AuditLogRepository();
const passwordResetTokenRepository = new PasswordResetTokenRepository();
const counterRepository = new CounterRepository();
const mediaAssetRepository = new MediaAssetRepository();

const jwtService = new JwtService();
const emailService = new EmailService();
const cloudinaryService = new CloudinaryService();
const auditHelper = new AuditHelper(auditLogRepository);

export const authService = new AuthService(
  userRepository,
  refreshTokenRepository,
  auditLogRepository,
  passwordResetTokenRepository,
  jwtService,
  emailService,
);

export const mediaService = new MediaService(mediaAssetRepository, cloudinaryService, auditHelper);
export const portfolioService = new PortfolioService(auditHelper);
export const serviceCatalogService = new ServiceCatalogService(auditHelper);
export const galleryService = new GalleryService(auditHelper);
export const testimonialService = new TestimonialService(auditHelper);
export const teamMemberService = new TeamMemberService(auditHelper);
export const websiteContentService = new WebsiteContentService(auditHelper);
export const seoService = new SeoService(auditHelper);
export const siteSettingsService = new SiteSettingsService(auditHelper);
export const bookingService = new BookingService(auditHelper);
export const availabilityService = new AvailabilityService(auditHelper);
export const dashboardService = new DashboardService();
export const publicService = new PublicService(availabilityService, counterRepository, portfolioService);
export const sitemapService = new SitemapService();

export {
  userRepository,
  refreshTokenRepository,
  auditLogRepository,
  passwordResetTokenRepository,
  counterRepository,
  jwtService,
  emailService,
  cloudinaryService,
  auditHelper,
};
