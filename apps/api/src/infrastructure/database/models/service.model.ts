import mongoose, { Document, Schema } from 'mongoose';
import { CloudinaryImageSchema, SeoSnapshotSchema } from '../schemas/shared.schemas';

export interface IServiceDocument extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  featuredImage: Record<string, unknown>;
  galleryImages: Record<string, unknown>[];
  category: string;
  duration: number;
  startingPrice: number;
  currency: string;
  isFeatured: boolean;
  isPublished: boolean;
  seo: Record<string, unknown>;
  seoId?: mongoose.Types.ObjectId;
  displayOrder: number;
  viewCount: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IServiceDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true, maxlength: 300 },
    fullDescription: { type: String, required: true },
    featuredImage: { type: CloudinaryImageSchema, required: true },
    galleryImages: { type: [CloudinaryImageSchema], default: [] },
    category: {
      type: String,
      enum: ['bridal', 'reception', 'engagement', 'party', 'editorial', 'fashion', 'hd_makeup', 'airbrush', 'other'],
      required: true,
    },
    duration: { type: Number, required: true, min: 0 },
    startingPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    isFeatured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: false, index: true },
    seo: { type: SeoSnapshotSchema, default: {} },
    seoId: { type: Schema.Types.ObjectId, ref: 'Seo' },
    displayOrder: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

ServiceSchema.index({ isPublished: 1, isFeatured: 1, displayOrder: 1 });
ServiceSchema.index({ isPublished: 1, category: 1, displayOrder: 1 });
ServiceSchema.index({ title: 'text', shortDescription: 'text', fullDescription: 'text' });

export const ServiceModel = mongoose.model<IServiceDocument>('Service', ServiceSchema);
