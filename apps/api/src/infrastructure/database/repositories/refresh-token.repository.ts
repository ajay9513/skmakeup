import { RefreshTokenModel } from '../models/refresh-token.model';
import {
  IRefreshTokenRepository,
  CreateRefreshTokenData,
} from '../../../domain/interfaces/repositories';
import { RefreshTokenEntity } from '../../../domain/entities';

function mapRefreshToken(doc: InstanceType<typeof RefreshTokenModel>): RefreshTokenEntity {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    tokenHash: doc.tokenHash,
    expiresAt: doc.expiresAt,
    createdByIp: doc.createdByIp,
    userAgent: doc.userAgent,
    revokedAt: doc.revokedAt,
    replacedByTokenId: doc.replacedByTokenId?.toString(),
    createdAt: doc.createdAt,
  };
}

export class RefreshTokenRepository implements IRefreshTokenRepository {
  async create(data: CreateRefreshTokenData): Promise<RefreshTokenEntity> {
    const doc = await RefreshTokenModel.create(data);
    return mapRefreshToken(doc);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    const doc = await RefreshTokenModel.findOne({ tokenHash }).exec();
    return doc ? mapRefreshToken(doc) : null;
  }

  async revoke(id: string, replacedByTokenId?: string): Promise<void> {
    await RefreshTokenModel.findByIdAndUpdate(id, {
      revokedAt: new Date(),
      ...(replacedByTokenId ? { replacedByTokenId } : {}),
    }).exec();
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany(
      { userId, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    ).exec();
  }

  async deleteExpired(): Promise<number> {
    const result = await RefreshTokenModel.deleteMany({
      expiresAt: { $lt: new Date() },
    }).exec();
    return result.deletedCount;
  }
}
