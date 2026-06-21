import { Request, Response, RequestHandler } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { sendSuccess, buildPaginationMeta } from '../../utils/response';
import { getAuthContext } from '../../utils/request';
import { getValidated } from '../middleware/validate.middleware';
import { BadRequestError } from '../../domain/errors';
import { logger } from '../../utils/logger';
import { validateMediaFolder } from '../../utils/media-folder';

import { ListQueryInput } from '@sk-makeup/shared';

function parseTags(raw: unknown): string[] | undefined {
  if (!raw || typeof raw !== 'string') return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) throw new Error('tags must be array');
    return parsed.filter((t): t is string => typeof t === 'string');
  } catch {
    throw new BadRequestError('Invalid tags JSON', 'INVALID_TAGS');
  }
}

type CrudService = {
  list: (query: ListQueryInput) => Promise<{ items: unknown[]; total: number; page: number; limit: number }>;
  getById: (id: string) => Promise<unknown>;
  create: (data: Record<string, unknown>, userId: string) => Promise<unknown>;
  update: (id: string, data: Record<string, unknown>, userId: string) => Promise<unknown>;
  delete: (id: string, userId: string) => Promise<unknown>;
};

export function createCrudHandlers(service: CrudService) {
  const list: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await service.list(getValidated<ListQueryInput>(req, 'query'));
    sendSuccess(res, result.items, 200, buildPaginationMeta(result.page, result.limit, result.total));
  });

  const getById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const item = await service.getById(String(req.params.id));
    sendSuccess(res, item);
  });

  const create: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const item = await service.create(req.body, req.user!.id);
    sendSuccess(res, item, 201);
  });

  const update: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const item = await service.update(String(req.params.id), req.body, req.user!.id);
    sendSuccess(res, item);
  });

  const remove: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await service.delete(String(req.params.id), req.user!.id);
    sendSuccess(res, result);
  });

  return { list, getById, create, update, remove };
}

export const createMediaHandlers = (mediaService: {
  upload: (file: Express.Multer.File, folder: string, userId: string, metadata?: Record<string, unknown>, ctx?: ReturnType<typeof getAuthContext>) => Promise<unknown>;
  uploadBulk: (files: Express.Multer.File[], folder: string, userId: string, ctx?: ReturnType<typeof getAuthContext>) => Promise<unknown>;
  list: (q: Record<string, unknown>) => Promise<{ items: unknown[]; total: number; page: number; limit: number }>;
  getById: (id: string) => Promise<unknown>;
  update: (id: string, data: Record<string, unknown>, userId: string) => Promise<unknown>;
  replace: (id: string, file: Express.Multer.File, userId: string, ctx?: ReturnType<typeof getAuthContext>) => Promise<unknown>;
  delete: (id: string, userId: string, ctx?: ReturnType<typeof getAuthContext>) => Promise<unknown>;
  restore: (id: string, userId: string) => Promise<unknown>;
  link: (id: string, data: Record<string, unknown>, userId: string) => Promise<unknown>;
}) => {
  const upload: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file?.buffer?.length) {
      logger.warn({ hasFile: Boolean(req.file), folder: req.query.folder }, 'Media upload rejected: no file in request');
      throw new BadRequestError('No image file received. Use multipart field name "file".', 'UPLOAD_NO_FILE');
    }
    const folder = validateMediaFolder(req.query.folder as string | undefined);
    logger.info({ folder, filename: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype }, 'Media upload started');
    const tags = parseTags(req.body.tags);
    const result = await mediaService.upload(
      req.file,
      folder,
      req.user!.id,
      { alt: req.body.alt, caption: req.body.caption, tags },
      getAuthContext(req),
    );
    logger.info({ folder, publicId: (result as { publicId?: string })?.publicId }, 'Media upload succeeded');
    sendSuccess(res, result, 201);
  });

  const uploadBulk: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const folder = validateMediaFolder(req.query.folder as string | undefined);
    const files = req.files as Express.Multer.File[];
    if (!files?.length) {
      throw new BadRequestError('No image files received. Use multipart field name "files".', 'UPLOAD_NO_FILES');
    }
    logger.info({ folder, count: files.length }, 'Bulk media upload started');
    const result = await mediaService.uploadBulk(files, folder, req.user!.id, getAuthContext(req));
    sendSuccess(res, result, 201);
  });

  const list: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await mediaService.list(getValidated<Record<string, unknown>>(req, 'query'));
    sendSuccess(res, result.items, 200, buildPaginationMeta(result.page, result.limit, result.total));
  });

  const getById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await mediaService.getById(String(req.params.id)));
  });

  const update: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await mediaService.update(String(req.params.id), req.body, req.user!.id));
  });

  const replace: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file?.buffer?.length) {
      throw new BadRequestError('No image file received. Use multipart field name "file".', 'UPLOAD_NO_FILE');
    }
    sendSuccess(res, await mediaService.replace(String(req.params.id), req.file, req.user!.id, getAuthContext(req)));
  });

  const remove: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await mediaService.delete(String(req.params.id), req.user!.id, getAuthContext(req)));
  });

  const restore: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await mediaService.restore(String(req.params.id), req.user!.id));
  });

  const link: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await mediaService.link(String(req.params.id), req.body, req.user!.id));
  });

  return { upload, uploadBulk, list, getById, update, replace, remove, restore, link };
};
