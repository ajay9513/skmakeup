import { Role, UserStatus } from '@sk-makeup/shared';

export interface CloudinaryImageEntity {
  mediaAssetId?: string;
  publicId: string;
  secureUrl: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  alt: string;
  caption?: string;
  order: number;
  isFeatured: boolean;
  folder: string;
  version?: number;
  createdAt?: Date;
}

export interface UserEntity {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  avatar?: CloudinaryImageEntity;
  lastLogin?: Date;
  passwordChangedAt?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenEntity {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdByIp?: string;
  userAgent?: string;
  revokedAt?: Date;
  replacedByTokenId?: string;
  createdAt: Date;
}

export interface AuditLogEntity {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface PasswordResetTokenEntity {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}
