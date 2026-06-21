import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../../domain/errors';
import { logger } from '../../utils/logger';
import { env } from '../../config/env';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err, requestId: req.requestId }, 'Non-operational error');
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_OBJECT_ID', message: 'Invalid ID format' },
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: Object.fromEntries(
          Object.entries(err.errors).map(([k, v]) => [k, v.message]),
        ),
      },
    });
    return;
  }

  if (err.name === 'MulterError' || err.message.includes('Only image files')) {
    res.status(400).json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: err.message },
    });
    return;
  }

  if (err.message.includes('not allowed by CORS')) {
    res.status(403).json({
      success: false,
      error: {
        code: 'CORS_ERROR',
        message: 'Origin not allowed',
      },
    });
    return;
  }

  logger.error({ err, requestId: req.requestId }, 'Unhandled error');

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    },
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'Route not found',
    },
  });
}
