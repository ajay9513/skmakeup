import { IUserDocument } from '../models/user.model';
import { UserEntity, CloudinaryImageEntity } from '../../../domain/entities';

function mapCloudinaryImage(image?: IUserDocument['avatar']): CloudinaryImageEntity | undefined {
  if (!image) return undefined;

  return {
    mediaAssetId: image.mediaAssetId?.toString(),
    publicId: image.publicId,
    secureUrl: image.secureUrl,
    url: image.url,
    width: image.width,
    height: image.height,
    format: image.format,
    bytes: image.bytes,
    alt: image.alt,
    caption: image.caption,
    order: image.order,
    isFeatured: image.isFeatured,
    folder: image.folder,
    version: image.version,
    createdAt: image.createdAt,
  };
}

export function mapUserDocumentToEntity(doc: IUserDocument): UserEntity {
  return {
    id: doc._id.toString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    passwordHash: doc.passwordHash,
    role: doc.role,
    status: doc.status,
    avatar: mapCloudinaryImage(doc.avatar),
    lastLogin: doc.lastLogin,
    passwordChangedAt: doc.passwordChangedAt,
    failedLoginAttempts: doc.failedLoginAttempts,
    lockUntil: doc.lockUntil,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function mapUserToAuthDto(doc: IUserDocument): import('@sk-makeup/shared').AuthUserDto {
  const avatar = mapCloudinaryImage(doc.avatar);

  return {
    id: doc._id.toString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    role: doc.role,
    status: doc.status,
    avatar: avatar
      ? {
          ...avatar,
          mediaAssetId: avatar.mediaAssetId,
          createdAt: avatar.createdAt?.toISOString(),
        }
      : undefined,
    lastLogin: doc.lastLogin?.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
