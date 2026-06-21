import { Request, Response, NextFunction } from 'express';
import { Role, PERMISSIONS } from '@sk-makeup/shared';
import { jwtService } from '../../container';
import { UnauthorizedError, ForbiddenError } from '../../domain/errors';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';

const userRepository = new UserRepository();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
      };
      requestId?: string;
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required', 'ACCESS_TOKEN_REQUIRED');
    }

    const token = authHeader.slice(7);
    const payload = jwtService.verifyAccessToken(token);

    const user = await userRepository.findById(payload.sub);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedError('User not found or inactive', 'INVALID_USER');
    }

    if (user.passwordChangedAt) {
      const tokenIssuedAt = jwtService.getTokenIssuedAt(token);
      if (tokenIssuedAt && user.passwordChangedAt.getTime() / 1000 > tokenIssuedAt) {
        throw new UnauthorizedError('Token invalidated due to password change', 'TOKEN_INVALIDATED');
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS'));
      return;
    }

    next();
  };
}

export function authorizePermission(permission: keyof typeof PERMISSIONS) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    const allowedRoles = PERMISSIONS[permission] as readonly Role[];

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS'));
      return;
    }

    next();
  };
}

export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  authenticate(req, _res, next).catch(next);
}
