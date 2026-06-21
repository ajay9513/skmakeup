import {
  UserEntity,
  RefreshTokenEntity,
  AuditLogEntity,
  PasswordResetTokenEntity,
} from '../../entities';

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: UserEntity['role'];
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserEntity['role'];
  status?: UserEntity['status'];
  avatar?: UserEntity['avatar'];
  lastLogin?: Date;
  passwordHash?: string;
  passwordChangedAt?: Date;
  failedLoginAttempts?: number;
  lockUntil?: Date | null;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(options: { page: number; limit: number }): Promise<{ users: UserEntity[]; total: number }>;
  create(data: CreateUserData): Promise<UserEntity>;
  update(id: string, data: UpdateUserData): Promise<UserEntity | null>;
  delete(id: string): Promise<boolean>;
  countByRole(role: UserEntity['role']): Promise<number>;
}

export interface CreateRefreshTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdByIp?: string;
  userAgent?: string;
}

export interface IRefreshTokenRepository {
  create(data: CreateRefreshTokenData): Promise<RefreshTokenEntity>;
  findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null>;
  revoke(id: string, replacedByTokenId?: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
  deleteExpired(): Promise<number>;
}

export interface CreateAuditLogData {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: AuditLogEntity['changes'];
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface IAuditLogRepository {
  create(data: CreateAuditLogData): Promise<AuditLogEntity>;
  findAll(options: { page: number; limit: number; userId?: string; entityType?: string }): Promise<{
    logs: AuditLogEntity[];
    total: number;
  }>;
}

export interface CreatePasswordResetTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface IPasswordResetTokenRepository {
  create(data: CreatePasswordResetTokenData): Promise<PasswordResetTokenEntity>;
  findByTokenHash(tokenHash: string): Promise<PasswordResetTokenEntity | null>;
  markAsUsed(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

export interface ICounterRepository {
  getNextSequence(name: string): Promise<number>;
}
