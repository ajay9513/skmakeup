import mongoose, { Document, Schema } from 'mongoose';
import { Role, UserStatus } from '@sk-makeup/shared';
import { CloudinaryImageSchema } from '../schemas/shared.schemas';

export interface IUserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  avatar?: {
    mediaAssetId?: mongoose.Types.ObjectId;
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
  };
  lastLogin?: Date;
  passwordChangedAt?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'editor', 'viewer'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
    avatar: { type: CloudinaryImageSchema },
    lastLogin: { type: Date },
    passwordChangedAt: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
  { timestamps: true },
);

UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ status: 1, lastLogin: -1 });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
