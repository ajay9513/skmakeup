import { Router, Request, Response } from 'express';
import {
  listQuerySchema,
  publicBookingSchema,
  publicContactSchema,
  slotCheckSchema,
} from '@sk-makeup/shared';
import { validate, getValidated } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../../utils/async-handler';
import { sendSuccess, buildPaginationMeta } from '../../../utils/response';
import { getAuthContext } from '../../../utils/request';
import { publicService, sitemapService } from '../../../container';
import { maintenanceGuard } from '../../middleware/maintenance.middleware';
import rateLimit from 'express-rate-limit';

const publicWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests' } },
});

const router = Router();

router.use(maintenanceGuard);

router.get('/site-settings', asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await publicService.getSiteSettings());
}));

router.get('/content/:page', asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await publicService.getPageContent(String(req.params.page)));
}));

router.get('/seo/:page', asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await publicService.getSeo(String(req.params.page)));
}));

router.get('/services', validate(listQuerySchema, 'query'), asyncHandler(async (req: Request, res: Response) => {
  const result = await publicService.getServices(getValidated(req, 'query'));
  sendSuccess(res, result.items, 200, buildPaginationMeta(result.page, result.limit, result.total));
}));

router.get('/services/:slug', asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await publicService.getServiceBySlug(String(req.params.slug)));
}));

router.get('/packages', asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await publicService.getPackages());
}));

router.get('/portfolio/preview/:token', asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await publicService.getPortfolioPreview(String(req.params.token)));
}));

router.get('/portfolio', validate(listQuerySchema, 'query'), asyncHandler(async (req: Request, res: Response) => {
  const result = await publicService.getPortfolio(getValidated(req, 'query'));
  sendSuccess(res, result.items, 200, buildPaginationMeta(result.page, result.limit, result.total));
}));

router.get('/portfolio/:slug', asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await publicService.getPortfolioBySlug(String(req.params.slug)));
}));

router.get('/gallery', validate(listQuerySchema, 'query'), asyncHandler(async (req: Request, res: Response) => {
  const result = await publicService.getGallery(getValidated(req, 'query'));
  sendSuccess(res, result.items, 200, buildPaginationMeta(result.page, result.limit, result.total));
}));

router.get('/testimonials', asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await publicService.getTestimonials());
}));

router.get('/team-members', asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await publicService.getTeamMembers());
}));

router.get('/availability/slots', validate(slotCheckSchema, 'query'), asyncHandler(async (req: Request, res: Response) => {
  const { date } = getValidated<{ date: string }>(req, 'query');
  sendSuccess(res, await publicService.getAvailableSlots(date));
}));

router.post('/bookings', publicWriteLimiter, validate(publicBookingSchema), asyncHandler(async (req: Request, res: Response) => {
  const ctx = getAuthContext(req);
  sendSuccess(res, await publicService.createBooking(req.body, ctx), 201);
}));

router.post('/contact', publicWriteLimiter, validate(publicContactSchema), asyncHandler(async (req: Request, res: Response) => {
  const ctx = getAuthContext(req);
  sendSuccess(res, await publicService.createContact(req.body, ctx), 201);
}));

router.get('/sitemap.xml', asyncHandler(async (_req: Request, res: Response) => {
  const xml = await sitemapService.generateXml();
  res.set('Content-Type', 'application/xml');
  res.send(xml);
}));

export default router;
