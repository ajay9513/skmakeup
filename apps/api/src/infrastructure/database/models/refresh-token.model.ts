import mongoose, { Document, Schema } from 'mongoose';

export interface IRefreshTokenDocument extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdByIp?: string;
  userAgent?: string;
  revokedAt?: Date;
  replacedByTokenId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    createdByIp: { type: String },
    userAgent: { type: String },
    revokedAt: { type: Date },
    replacedByTokenId: { type: Schema.Types.ObjectId, ref: 'RefreshToken' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RefreshTokenSchema.index({ userId: 1, revokedAt: 1 });

export const RefreshTokenModel = mongoose.model<IRefreshTokenDocument>(
  'RefreshToken',
  RefreshTokenSchema,
);
