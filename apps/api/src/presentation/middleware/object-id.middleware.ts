import { Request, Response, NextFunction } from 'express';
import { objectIdSchema } from '@sk-makeup/shared';
import { BadRequestError } from '../../domain/errors';

const ID_PARAMS = ['id'];

export function validateObjectIdParams(req: Request, _res: Response, next: NextFunction) {
  for (const key of ID_PARAMS) {
    const value = req.params[key];
    if (value === undefined) continue;
    const parsed = objectIdSchema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestError(`Invalid ${key}`, 'INVALID_OBJECT_ID');
    }
  }
  next();
}
