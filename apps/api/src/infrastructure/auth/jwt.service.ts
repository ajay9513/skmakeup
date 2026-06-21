import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env';
import { IJwtService } from '../../domain/interfaces/services';
import { UnauthorizedError } from '../../domain/errors';

type StringValue = `${number}${'ms' | 's' | 'm' | 'h' | 'd'}`;

function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) {
    throw new Error(`Invalid duration: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return value * multipliers[unit];
}

export class JwtService implements IJwtService {
  generateAccessToken(payload: { sub: string; email: string; role: string }): string {
    return jwt.sign(
      { ...payload, type: 'access' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as StringValue },
    );
  }

  generateRefreshToken(payload: { sub: string; jti: string }): string {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as StringValue },
    );
  }

  verifyAccessToken(token: string): { sub: string; email: string; role: string } {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;

      if (decoded.type !== 'access' || !decoded.sub || !decoded.email || !decoded.role) {
        throw new UnauthorizedError('Invalid access token', 'INVALID_ACCESS_TOKEN');
      }

      return {
        sub: decoded.sub,
        email: decoded.email as string,
        role: decoded.role as string,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Invalid or expired access token', 'INVALID_ACCESS_TOKEN');
    }
  }

  verifyRefreshToken(token: string): { sub: string; jti: string } {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;

      if (decoded.type !== 'refresh' || !decoded.sub || !decoded.jti) {
        throw new UnauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
      }

      return {
        sub: decoded.sub,
        jti: decoded.jti as string,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }
  }

  getAccessTokenExpiresIn(): string {
    return env.JWT_ACCESS_EXPIRES_IN;
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  getRefreshTokenExpiryDate(): Date {
    const durationMs = parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN);
    return new Date(Date.now() + durationMs);
  }

  getTokenIssuedAt(token: string): number | undefined {
    const decoded = jwt.decode(token) as jwt.JwtPayload | null;
    return decoded?.iat;
  }
}
