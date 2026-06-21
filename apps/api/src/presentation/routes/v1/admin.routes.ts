import { Router, Request, Response } from 'express';
import {
  listQuerySchema,
  mediaListQuerySchema,
  createServiceSchema,
  updateServiceSchema,
  createPortfolioSchema,
  updatePortfolioSchema,
  createGallerySchema,
  updateGallerySchema,
  createTestimonialSchema,
  updateTestimonialSchema,
  createTeamMemberSchema,
  updateTeamMemberSchema,
  createWebsiteContentSchema,
  updateWebsiteContentSchema,
  createSeoSchema,
  updateSeoSchema,
  updateSiteSettingsSchema,
  reorderImagesSchema,
  weeklyAvailabilitySchema,
  blockedDateSchema,
  slotCheckSchema,
  updateBookingStatusSchema,
  updateMediaSchema,
  linkMediaSchema,
} from '@sk-makeup/shared';
import { authenticate, authorizePermission } from '../../middleware/auth.middleware';
import { objectIdSchema } from '@sk-makeup/shared';
import { BadRequestError } from '../../../domain/errors';
import { validate, getValidated } from '../../middleware/validate.middleware';
import { uploadSingle, uploadBulk } from '../../middleware/upload.middleware';
import { mediaUploadRateLimiter } from '../../middleware/rate-limiter.middleware';
import { createCrudHandlers, createMediaHandlers } from '../../controllers/admin.controller';
import { asyncHandler } from '../../../utils/async-handler';
import { sendSuccess, buildPaginationMeta } from '../../../utils/response';
import {
  mediaService,
  portfolioService,
  serviceCatalogService,
  galleryService,
  testimonialService,
  teamMemberService,
  websiteContentService,
  seoService,
  siteSettingsService,
  bookingService,
  availabilityService,
  dashboardService,
} from '../../../container';

const router = Router();

router.use(authenticate);
router.use(authorizePermission('VIEW_DASHBOARD'));
router.param('id', (_req, _res, next, id) => {
  const parsed = objectIdSchema.safeParse(id);
  if (!parsed.success) return next(new BadRequestError('Invalid ID', 'INVALID_OBJECT_ID'));
  next();
});

// Dashboard
router.get('/dashboard/stats', asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await dashboardService.getStats());
}));

// Media
const media = createMediaHandlers(mediaService as unknown as Parameters<typeof createMediaHandlers>[0]);
router.get('/media', authorizePermission('UPLOAD_MEDIA'), validate(mediaListQuerySchema, 'query'), media.list);
router.get('/media/:id', authorizePermission('UPLOAD_MEDIA'), media.getById);
router.post('/media/upload', authorizePermission('UPLOAD_MEDIA'), mediaUploadRateLimiter, uploadSingle, media.upload);
router.post('/media/upload/bulk', authorizePermission('UPLOAD_MEDIA'), mediaUploadRateLimiter, uploadBulk, media.uploadBulk);
router.patch('/media/:id', authorizePermission('UPLOAD_MEDIA'), validate(updateMediaSchema), media.update);
router.post('/media/:id/replace', authorizePermission('UPLOAD_MEDIA'), mediaUploadRateLimiter, uploadSingle, media.replace);
router.delete('/media/:id', authorizePermission('DELETE_MEDIA'), media.remove);
router.post('/media/:id/restore', authorizePermission('DELETE_MEDIA'), media.restore);
router.post('/media/:id/link', authorizePermission('UPLOAD_MEDIA'), validate(linkMediaSchema), media.link);

// Services
const services = createCrudHandlers(serviceCatalogService);
router.get('/services', validate(listQuerySchema, 'query'), services.list);
router.get('/services/:id', services.getById);
router.post('/services', authorizePermission('MANAGE_CONTENT'), validate(createServiceSchema), services.create);
router.patch('/services/:id', authorizePermission('MANAGE_CONTENT'), validate(updateServiceSchema), services.update);
router.delete('/services/:id', authorizePermission('DELETE_CONTENT'), services.remove);

// Portfolio
const portfolioHandlers = createCrudHandlers(portfolioService);
router.get('/portfolio', validate(listQuerySchema, 'query'), portfolioHandlers.list);
router.get('/portfolio/:id', portfolioHandlers.getById);
router.post('/portfolio', authorizePermission('MANAGE_CONTENT'), validate(createPortfolioSchema), portfolioHandlers.create);
router.patch('/portfolio/:id', authorizePermission('MANAGE_CONTENT'), validate(updatePortfolioSchema), portfolioHandlers.update);
router.delete('/portfolio/:id', authorizePermission('DELETE_CONTENT'), portfolioHandlers.remove);
router.patch('/portfolio/:id/reorder-images', authorizePermission('MANAGE_CONTENT'), validate(reorderImagesSchema), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await portfolioService.reorderImages(String(req.params.id), req.body.images, req.user!.id));
}));
router.post('/portfolio/:id/duplicate', authorizePermission('MANAGE_CONTENT'), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await portfolioService.duplicate(String(req.params.id), req.user!.id), 201);
}));
router.post('/portfolio/:id/preview-token', authorizePermission('MANAGE_CONTENT'), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await portfolioService.regeneratePreviewToken(String(req.params.id), req.user!.id));
}));

// Gallery
const galleryHandlers = createCrudHandlers(galleryService);
router.get('/gallery', validate(listQuerySchema, 'query'), galleryHandlers.list);
router.get('/gallery/:id', galleryHandlers.getById);
router.post('/gallery', authorizePermission('MANAGE_CONTENT'), validate(createGallerySchema), galleryHandlers.create);
router.patch('/gallery/:id', authorizePermission('MANAGE_CONTENT'), validate(updateGallerySchema), galleryHandlers.update);
router.delete('/gallery/:id', authorizePermission('DELETE_CONTENT'), galleryHandlers.remove);
router.patch('/gallery/:id/reorder-images', authorizePermission('MANAGE_CONTENT'), validate(reorderImagesSchema), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await galleryService.reorderImages(String(req.params.id), req.body.images, req.user!.id));
}));

// Testimonials
const testimonialHandlers = createCrudHandlers(testimonialService);
router.get('/testimonials', validate(listQuerySchema, 'query'), testimonialHandlers.list);
router.get('/testimonials/:id', testimonialHandlers.getById);
router.post('/testimonials', authorizePermission('MANAGE_CONTENT'), validate(createTestimonialSchema), testimonialHandlers.create);
router.patch('/testimonials/:id', authorizePermission('MANAGE_CONTENT'), validate(updateTestimonialSchema), testimonialHandlers.update);
router.delete('/testimonials/:id', authorizePermission('DELETE_CONTENT'), testimonialHandlers.remove);

// Team Members
const teamHandlers = createCrudHandlers(teamMemberService);
router.get('/team-members', validate(listQuerySchema, 'query'), teamHandlers.list);
router.get('/team-members/:id', teamHandlers.getById);
router.post('/team-members', authorizePermission('MANAGE_CONTENT'), validate(createTeamMemberSchema), teamHandlers.create);
router.patch('/team-members/:id', authorizePermission('MANAGE_CONTENT'), validate(updateTeamMemberSchema), teamHandlers.update);
router.delete('/team-members/:id', authorizePermission('DELETE_CONTENT'), teamHandlers.remove);

// Website Content
const contentHandlers = createCrudHandlers(websiteContentService);
router.get('/website-content', validate(listQuerySchema, 'query'), contentHandlers.list);
router.get('/website-content/page/:page', asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await websiteContentService.getByPage(String(req.params.page), true));
}));
router.get('/website-content/:id', contentHandlers.getById);
router.post('/website-content', authorizePermission('MANAGE_CONTENT'), validate(createWebsiteContentSchema), contentHandlers.create);
router.patch('/website-content/:id', authorizePermission('MANAGE_CONTENT'), validate(updateWebsiteContentSchema), contentHandlers.update);
router.delete('/website-content/:id', authorizePermission('DELETE_CONTENT'), contentHandlers.remove);

// SEO
const seoHandlers = createCrudHandlers(seoService);
router.get('/seo', validate(listQuerySchema, 'query'), seoHandlers.list);
router.get('/seo/:id', seoHandlers.getById);
router.post('/seo', authorizePermission('MANAGE_SEO'), validate(createSeoSchema), seoHandlers.create);
router.patch('/seo/:id', authorizePermission('MANAGE_SEO'), validate(updateSeoSchema), seoHandlers.update);
router.delete('/seo/:id', authorizePermission('DELETE_CONTENT'), seoHandlers.remove);

// Site Settings
router.get('/site-settings', asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await siteSettingsService.get());
}));
router.patch('/site-settings', authorizePermission('MANAGE_SETTINGS'), validate(updateSiteSettingsSchema), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await siteSettingsService.update(req.body, req.user!.id));
}));

// Bookings
router.get('/bookings', authorizePermission('MANAGE_BOOKINGS'), validate(listQuerySchema, 'query'), asyncHandler(async (req: Request, res: Response) => {
  const result = await bookingService.list(getValidated(req, 'query'));
  sendSuccess(res, result.items, 200, buildPaginationMeta(result.page, result.limit, result.total));
}));
router.get('/bookings/:id', authorizePermission('MANAGE_BOOKINGS'), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await bookingService.getById(String(req.params.id)));
}));
router.patch('/bookings/:id/status', authorizePermission('MANAGE_BOOKINGS'), validate(updateBookingStatusSchema), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await bookingService.updateStatus(String(req.params.id), req.body, req.user!.id));
}));

// Availability
router.get('/availability/weekly', authorizePermission('MANAGE_AVAILABILITY'), asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await availabilityService.getWeekly());
}));
router.put('/availability/weekly', authorizePermission('MANAGE_AVAILABILITY'), validate(weeklyAvailabilitySchema), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await availabilityService.setWeekly(req.body.dayOfWeek, req.body.slots, req.user!.id));
}));
router.get('/availability/blocked', authorizePermission('MANAGE_AVAILABILITY'), asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await availabilityService.getBlockedDates());
}));
router.post('/availability/blocked', authorizePermission('MANAGE_AVAILABILITY'), validate(blockedDateSchema), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await availabilityService.addBlockedDate(req.body, req.user!.id), 201);
}));
router.delete('/availability/blocked/:id', authorizePermission('MANAGE_AVAILABILITY'), asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await availabilityService.removeBlockedDate(String(req.params.id), req.user!.id));
}));
router.get('/availability/slots', validate(slotCheckSchema, 'query'), asyncHandler(async (req: Request, res: Response) => {
  const { date } = getValidated<{ date: string }>(req, 'query');
  sendSuccess(res, await availabilityService.getAvailableSlots(date));
}));

export default router;
