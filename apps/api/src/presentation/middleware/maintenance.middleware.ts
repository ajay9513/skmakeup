import { Request, Response, NextFunction } from 'express';
import { SiteSettingsModel } from '../../infrastructure/database/models/site-settings.model';

let cachedMaintenance: { value: boolean; expiresAt: number } | null = null;

async function isMaintenanceMode(): Promise<boolean> {
  const now = Date.now();
  if (cachedMaintenance && cachedMaintenance.expiresAt > now) {
    return cachedMaintenance.value;
  }

  const doc = await SiteSettingsModel.findOne({ isActive: true }).select('maintenanceMode').lean().exec();
  const value = Boolean(doc?.maintenanceMode);
  cachedMaintenance = { value, expiresAt: now + 60_000 };
  return value;
}

export async function maintenanceGuard(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }

  const path = req.path;
  if (path.endsWith('/site-settings') || path.endsWith('/health')) {
    return next();
  }

  if (await isMaintenanceMode()) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'MAINTENANCE_MODE',
        message: 'The site is temporarily unavailable for maintenance.',
      },
    });
  }

  return next();
}
