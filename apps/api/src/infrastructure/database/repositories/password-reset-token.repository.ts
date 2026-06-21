import { PasswordResetTokenModel } from '../models/password-reset-token.model';
import {
  IPasswordResetTokenRepository,
  CreatePasswordResetTokenData,
} from '../../../domain/interfaces/repositories';
import { PasswordResetTokenEntity } from '../../../domain/entities';

function mapPasswordResetToken(
  doc: InstanceType<typeof PasswordResetTokenModel>,
): PasswordResetTokenEntity {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    tokenHash: doc.tokenHash,
    expiresAt: doc.expiresAt,
    usedAt: doc.usedAt,
    createdAt: doc.createdAt,
  };
}

export class PasswordResetTokenRepository implements IPasswordResetTokenRepository {
  async create(data: CreatePasswordResetTokenData): Promise<PasswordResetTokenEntity> {
    const doc = await PasswordResetTokenModel.create(data);
    return mapPasswordResetToken(doc);
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetTokenEntity | null> {
    const doc = await PasswordResetTokenModel.findOne({ tokenHash }).exec();
    return doc ? mapPasswordResetToken(doc) : null;
  }

  async markAsUsed(id: string): Promise<void> {
    await PasswordResetTokenModel.findByIdAndUpdate(id, { usedAt: new Date() }).exec();
  }

  async deleteByUserId(userId: string): Promise<void> {
    await PasswordResetTokenModel.deleteMany({ userId }).exec();
  }
}
