import { Router } from 'express';
import v1Routes from './v1';
import { API_PREFIX } from '@sk-makeup/shared';

const router = Router();

router.use(API_PREFIX, v1Routes);

export default router;
