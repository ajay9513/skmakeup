import { MediaAssetRepository } from '../../infrastructure/database/repositories/media-asset.repository';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';
import { AuditHelper } from '../helpers/audit.helper';
import { UpdateMediaInput, LinkMediaInput } from '@sk-makeup/shared';
import { validateImageMagicBytes } from '../../utils/image-magic-bytes';
import { validateMediaFolder } from '../../utils/media-folder';
import { NotFoundError, BadRequestError } from '../../domain/errors';

export class MediaService {
  constructor(
    private readonly mediaRepository: MediaAssetRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly auditHelper: AuditHelper,
  ) {}

  async upload(
    file: Express.Multer.File,
    folder: string,
    userId: string,
    metadata?: { alt?: string; caption?: string; tags?: string[] },
    context?: { ipAddress?: string; userAgent?: string },
  ) {
    if (!file?.buffer) throw new BadRequestError('No file provided');
    if (!validateImageMagicBytes(file.buffer)) {
      throw new BadRequestError('File content is not a valid image', 'INVALID_IMAGE');
    }
    validateMediaFolder(folder);

    const uploadResult = await this.cloudinaryService.uploadImage(
      file.buffer,
      folder,
      file.originalname,
    );

    const asset = await this.mediaRepository.create({
      publicId: uploadResult.publicId,
      secureUrl: uploadResult.secureUrl,
      url: uploadResult.url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      size: uploadResult.bytes,
      folder: uploadResult.folder,
      uploadedBy: userId,
      originalFilename: file.originalname,
      alt: metadata?.alt || '',
      caption: metadata?.caption || '',
      tags: metadata?.tags || [],
    });

    await this.auditHelper.log({
      userId,
      action: 'media.upload',
      entityType: 'media_asset',
      entityId: asset.id,
      metadata: { publicId: asset.publicId, folder },
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    return asset;
  }

  async uploadBulk(
    files: Express.Multer.File[],
    folder: string,
    userId: string,
    context?: { ipAddress?: string; userAgent?: string },
  ) {
    const results = await Promise.all(
      files.map((file) => this.upload(file, folder, userId, {}, context)),
    );
    return results;
  }

  async list(query: Parameters<MediaAssetRepository['findAll']>[0]) {
    return this.mediaRepository.findAll(query);
  }

  async getById(id: string) {
    const asset = await this.mediaRepository.findById(id);
    if (!asset) throw new NotFoundError('Media asset not found');
    return asset;
  }

  async update(id: string, data: UpdateMediaInput, userId: string) {
    const asset = await this.mediaRepository.update(id, data);

    await this.auditHelper.log({
      userId,
      action: 'media.update',
      entityType: 'media_asset',
      entityId: id,
      changes: { after: data as Record<string, unknown> },
    });

    return asset;
  }

  async replace(
    id: string,
    file: Express.Multer.File,
    userId: string,
    context?: { ipAddress?: string; userAgent?: string },
  ) {
    const existing = await this.getById(id);
    if (!file?.buffer) throw new BadRequestError('No file provided');
    if (!validateImageMagicBytes(file.buffer)) {
      throw new BadRequestError('File content is not a valid image', 'INVALID_IMAGE');
    }
    if (existing.status === 'deleted') throw new BadRequestError('Cannot replace deleted media');

    const uploadResult = await this.cloudinaryService.replaceImage(existing.publicId, file.buffer);

    const updated = await this.mediaRepository.update(id, {
      secureUrl: uploadResult.secureUrl,
      url: uploadResult.url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      size: uploadResult.bytes,
      originalFilename: file.originalname,
      version: uploadResult.version,
    } as Parameters<MediaAssetRepository['update']>[1]);

    await this.auditHelper.log({
      userId,
      action: 'media.replace',
      entityType: 'media_asset',
      entityId: id,
      metadata: { publicId: uploadResult.publicId },
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    return updated;
  }

  async delete(id: string, userId: string, context?: { ipAddress?: string; userAgent?: string }) {
    const asset = await this.getById(id);
    const deleted = await this.mediaRepository.softDelete(id);
    try {
      await this.cloudinaryService.deleteImage(asset.publicId);
    } catch {
      // DB already soft-deleted; Cloudinary asset may already be gone
    }

    await this.auditHelper.log({
      userId,
      action: 'media.delete',
      entityType: 'media_asset',
      entityId: id,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    return deleted;
  }

  async restore(id: string, userId: string) {
    const asset = await this.getById(id);
    if (asset.status !== 'deleted') throw new BadRequestError('Media is not deleted');

    await this.cloudinaryService.restoreImage(asset.publicId);
    const restored = await this.mediaRepository.restore(id);

    await this.auditHelper.log({
      userId,
      action: 'media.restore',
      entityType: 'media_asset',
      entityId: id,
    });

    return restored;
  }

  async link(id: string, data: LinkMediaInput, userId: string) {
    const asset = await this.mediaRepository.linkToEntity(
      id,
      data.entityType,
      data.entityId,
      data.entityField,
    );

    await this.auditHelper.log({
      userId,
      action: 'media.link',
      entityType: 'media_asset',
      entityId: id,
      metadata: data as Record<string, unknown>,
    });

    return asset;
  }
}
