import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import publicRoutes from './public.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/public', publicRoutes);

export default router;
