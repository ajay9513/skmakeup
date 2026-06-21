import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { LoginInput, ChangePasswordInput, AuthResult } from '@sk-makeup/shared';
import { env } from '../../config/env';
import {
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  NotFoundError,
  AccountLockedError,
} from '../../domain/errors';
import {
  IAuthService,
  AuthContext,
  IJwtService,
  IEmailService,
} from '../../domain/interfaces/services';
import {
  IUserRepository,
  IRefreshTokenRepository,
  IAuditLogRepository,
  IPasswordResetTokenRepository,
} from '../../domain/interfaces/repositories';
import { UserModel } from '../../infrastructure/database/models/user.model';
import { mapUserToAuthDto } from '../../infrastructure/database/mappers/user.mapper';

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly auditLogRepository: IAuditLogRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly jwtService: IJwtService,
    private readonly emailService: IEmailService,
  ) {}

  async login(input: LoginInput, context: AuthContext): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (user.status !== 'active') {
      throw new ForbiddenError('Account is not active', 'ACCOUNT_INACTIVE');
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new AccountLockedError();
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id, user.failedLoginAttempts);
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    await this.userRepository.update(user.id, {
      failedLoginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date(),
    });

    const tokens = await this.issueTokens(user.id, user.email, user.role, context);

    const userDoc = await UserModel.findById(user.id).exec();
    if (!userDoc) {
      throw new NotFoundError('User not found');
    }

    await this.auditLogRepository.create({
      userId: user.id,
      action: 'auth.login',
      entityType: 'user',
      entityId: user.id,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      ...tokens,
      user: mapUserToAuthDto(userDoc),
    };
  }

  async refresh(refreshToken: string, context: AuthContext): Promise<AuthResult> {
    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    const tokenHash = this.jwtService.hashToken(refreshToken);

    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      await this.refreshTokenRepository.revokeAllForUser(payload.sub);
      throw new UnauthorizedError('Refresh token reuse detected', 'TOKEN_REUSE_DETECTED');
    }

    if (storedToken.revokedAt) {
      await this.refreshTokenRepository.revokeAllForUser(payload.sub);
      throw new UnauthorizedError('Refresh token reuse detected', 'TOKEN_REUSE_DETECTED');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired', 'REFRESH_TOKEN_EXPIRED');
    }

    const user = await this.userRepository.findById(payload.sub);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedError('User not found or inactive', 'INVALID_USER');
    }

    const newRefreshToken = this.jwtService.generateRefreshToken({
      sub: user.id,
      jti: uuidv4(),
    });
    const newTokenHash = this.jwtService.hashToken(newRefreshToken);

    const newStoredToken = await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt: this.jwtService.getRefreshTokenExpiryDate(),
      createdByIp: context.ipAddress,
      userAgent: context.userAgent,
    });

    await this.refreshTokenRepository.revoke(storedToken.id, newStoredToken.id);

    const accessToken = this.jwtService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const userDoc = await UserModel.findById(user.id).exec();
    if (!userDoc) {
      throw new NotFoundError('User not found');
    }

    return {
      accessToken,
      expiresIn: this.jwtService.getAccessTokenExpiresIn(),
      user: mapUserToAuthDto(userDoc),
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string, userId?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = this.jwtService.hashToken(refreshToken);
      const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

      if (storedToken) {
        await this.refreshTokenRepository.revoke(storedToken.id);
      }
    }

    if (userId) {
      await this.auditLogRepository.create({
        userId,
        action: 'auth.logout',
        entityType: 'user',
        entityId: userId,
      });
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllForUser(userId);

    await this.auditLogRepository.create({
      userId,
      action: 'auth.logout_all',
      entityType: 'user',
      entityId: userId,
    });
  }

  async getMe(userId: string): Promise<import('@sk-makeup/shared').AuthUserDto> {
    const userDoc = await UserModel.findById(userId).exec();

    if (!userDoc) {
      throw new NotFoundError('User not found');
    }

    return mapUserToAuthDto(userDoc);
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isCurrentValid = await bcrypt.compare(input.currentPassword, user.passwordHash);

    if (!isCurrentValid) {
      throw new BadRequestError('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
    }

    const passwordHash = await bcrypt.hash(input.newPassword, env.BCRYPT_ROUNDS);

    await this.userRepository.update(userId, {
      passwordHash,
      passwordChangedAt: new Date(),
    });

    await this.refreshTokenRepository.revokeAllForUser(userId);

    await this.auditLogRepository.create({
      userId,
      action: 'auth.password_change',
      entityType: 'user',
      entityId: userId,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.jwtService.hashToken(rawToken);

    await this.passwordResetTokenRepository.deleteByUserId(user.id);

    await this.passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    await this.emailService.sendPasswordResetEmail(
      user.email,
      rawToken,
      `${user.firstName} ${user.lastName}`,
    );
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const tokenHash = this.jwtService.hashToken(token);
    const resetToken = await this.passwordResetTokenRepository.findByTokenHash(tokenHash);

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired reset token', 'INVALID_RESET_TOKEN');
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    await this.userRepository.update(resetToken.userId, {
      passwordHash,
      passwordChangedAt: new Date(),
      failedLoginAttempts: 0,
      lockUntil: null,
    });

    await this.passwordResetTokenRepository.markAsUsed(resetToken.id);
    await this.refreshTokenRepository.revokeAllForUser(resetToken.userId);

    await this.auditLogRepository.create({
      userId: resetToken.userId,
      action: 'auth.password_reset',
      entityType: 'user',
      entityId: resetToken.userId,
    });
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: string,
    context: AuthContext,
  ): Promise<{ accessToken: string; expiresIn: string; refreshToken: string }> {
    const jti = uuidv4();
    const refreshToken = this.jwtService.generateRefreshToken({ sub: userId, jti });
    const tokenHash = this.jwtService.hashToken(refreshToken);

    await this.refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt: this.jwtService.getRefreshTokenExpiryDate(),
      createdByIp: context.ipAddress,
      userAgent: context.userAgent,
    });

    const accessToken = this.jwtService.generateAccessToken({ sub: userId, email, role });

    return {
      accessToken,
      expiresIn: this.jwtService.getAccessTokenExpiresIn(),
      refreshToken,
    };
  }

  private async handleFailedLogin(userId: string, currentAttempts: number): Promise<void> {
    const attempts = currentAttempts + 1;

    if (attempts >= env.MAX_FAILED_LOGIN_ATTEMPTS) {
      await this.userRepository.update(userId, {
        failedLoginAttempts: attempts,
        lockUntil: new Date(Date.now() + env.ACCOUNT_LOCK_DURATION_MINUTES * 60 * 1000),
      });
      return;
    }

    await this.userRepository.update(userId, { failedLoginAttempts: attempts });
  }
}
