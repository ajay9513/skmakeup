import { Request } from 'express';

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];

  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }

  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }

  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function getUserAgent(req: Request): string {
  return req.headers['user-agent'] || 'unknown';
}

export function getAuthContext(req: Request): { ipAddress: string; userAgent: string } {
  return {
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
  };
}
