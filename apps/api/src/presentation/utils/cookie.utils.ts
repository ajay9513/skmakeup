import { Response } from 'express';
import { env } from '../../config/env';
import { REFRESH_TOKEN_COOKIE } from '@sk-makeup/shared';

function parseRefreshExpiryMs(): number {
  const match = env.JWT_REFRESH_EXPIRES_IN.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const value = Number(match[1]);
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return value * multipliers[match[2]];
}

export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    domain: env.COOKIE_DOMAIN === 'localhost' ? undefined : env.COOKIE_DOMAIN,
    maxAge: parseRefreshExpiryMs(),
    path: '/api/v1/auth',
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    domain: env.COOKIE_DOMAIN === 'localhost' ? undefined : env.COOKIE_DOMAIN,
    path: '/api/v1/auth',
  });
}

export function stripRefreshToken<T extends { refreshToken?: string }>(
  result: T,
): Omit<T, 'refreshToken'> {
  const { refreshToken: _, ...rest } = result;
  return rest;
}
