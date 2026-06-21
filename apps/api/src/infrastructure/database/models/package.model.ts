import mongoose, { Document, Schema } from 'mongoose';
import { CloudinaryImageSchema, SeoSnapshotSchema } from '../schemas/shared.schemas';

export interface IPackageDocument extends Document {
  title: string;
  slug: string;
  description: string;
  packagePrice: number;
  compareAtPrice?: number;
  currency: string;
  includedServices: mongoose.Types.ObjectId[];
  featuredImage: Record<string, unknown>;
  galleryImages: Record<string, unknown>[];
  isFeatured: boolean;
  isPublished: boolean;
  seo: Record<string, unknown>;
  seoId?: mongoose.Types.ObjectId;
  displayOrder: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<IPackageDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    packagePrice: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    includedServices: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    featuredImage: { type: CloudinaryImageSchema, required: true },
    galleryImages: { type: [CloudinaryImageSchema], default: [] },
    isFeatured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: false, index: true },
    seo: { type: SeoSnapshotSchema, default: {} },
    seoId: { type: Schema.Types.ObjectId, ref: 'Seo' },
    displayOrder: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

PackageSchema.index({ isPublished: 1, isFeatured: 1, displayOrder: 1 });
PackageSchema.index({ includedServices: 1 });
PackageSchema.index({ title: 'text', description: 'text' });

export const PackageModel = mongoose.model<IPackageDocument>('Package', PackageSchema);
