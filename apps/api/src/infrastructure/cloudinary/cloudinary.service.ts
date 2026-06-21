import { Readable } from 'stream';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { cloudinary as cloudinaryClient, getCloudinaryFolder, isCloudinaryConfigured } from '../../config/cloudinary';
import { BadRequestError, InternalServerError } from '../../domain/errors';

const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'];

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  version: number;
  folder: string;
}

export class CloudinaryService {
  ensureConfigured(): void {
    if (!isCloudinaryConfigured()) {
      throw new BadRequestError(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
        'CLOUDINARY_NOT_CONFIGURED',
      );
    }
  }

  async uploadImage(
    buffer: Buffer,
    subfolder: string,
    originalFilename?: string,
  ): Promise<CloudinaryUploadResult> {
    this.ensureConfigured();

    const folder = getCloudinaryFolder(subfolder);
    const publicIdPrefix = originalFilename
      ? originalFilename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50)
      : `img_${Date.now()}`;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinaryClient.uploader.upload_stream(
        {
          folder,
          public_id: `${publicIdPrefix}_${Date.now()}`,
          resource_type: 'image',
          quality: 'auto:best',
          fetch_format: 'auto',
          overwrite: false,
        },
        (error, result) => {
          if (error || !result) {
            reject(new InternalServerError(error?.message || 'Cloudinary upload failed'));
            return;
          }

          resolve(this.mapUploadResult(result, folder));
        },
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }

  async replaceImage(
    publicId: string,
    buffer: Buffer,
  ): Promise<CloudinaryUploadResult> {
    this.ensureConfigured();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinaryClient.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: 'image',
          overwrite: true,
          invalidate: true,
          quality: 'auto:best',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            reject(new InternalServerError(error?.message || 'Cloudinary replace failed'));
            return;
          }

          const folder = publicId.includes('/') ? publicId.split('/').slice(0, -1).join('/') : getCloudinaryFolder('temp');
          resolve(this.mapUploadResult(result, folder));
        },
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    this.ensureConfigured();
    await cloudinaryClient.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  }

  async restoreImage(_publicId: string): Promise<void> {
    this.ensureConfigured();
    // Cloudinary Node SDK v2 does not expose uploader.restore — DB status is reactivated.
    // If the asset was hard-deleted from Cloudinary, re-upload is required.
  }

  validateImageFormat(format: string): boolean {
    return ALLOWED_FORMATS.includes(format.toLowerCase());
  }

  private mapUploadResult(result: UploadApiResponse, folder: string): CloudinaryUploadResult {
    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      version: result.version,
      folder,
    };
  }
}

export { cloudinary };
