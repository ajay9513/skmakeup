import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../../domain/errors';

export type ValidationTarget = 'body' | 'query' | 'params';

/** Returns Zod-parsed input. Express 5 makes req.query/params read-only — never assign to them. */
export function getValidated<T>(req: Request, target: ValidationTarget): T {
  const parsed = req.validated?.[target];
  if (parsed !== undefined) {
    return parsed as T;
  }
  return req[target] as T;
}

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      req.validated ??= {};
      req.validated[target] = parsed;

      // Body remains writable in Express 5; query/params must not be reassigned.
      if (target === 'body') {
        req.body = parsed;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new BadRequestError('Validation failed', 'VALIDATION_ERROR', {
            issues: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          }),
        );
        return;
      }
      next(error);
    }
  };
}
