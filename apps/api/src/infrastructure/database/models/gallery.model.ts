import mongoose, { Document, Schema } from 'mongoose';
import { PORTFOLIO_CATEGORIES } from '@sk-makeup/shared';
import { CloudinaryImageSchema, SeoSnapshotSchema } from '../schemas/shared.schemas';

export interface IGalleryDocument extends Document {
  title: string;
  slug?: string;
  category: string;
  description?: string;
  images: Record<string, unknown>[];
  displayOrder: number;
  featured: boolean;
  isPublished: boolean;
  seo: Record<string, unknown>;
  seoId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGalleryDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, lowercase: true, trim: true },
    category: {
      type: String,
      enum: [...PORTFOLIO_CATEGORIES, 'General'],
      required: true,
      index: true,
    },
    description: { type: String },
    images: { type: [CloudinaryImageSchema], default: [] },
    displayOrder: { type: Number, default: 0 },
    featured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: false, index: true },
    seo: { type: SeoSnapshotSchema, default: {} },
    seoId: { type: Schema.Types.ObjectId, ref: 'Seo' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

GallerySchema.index({ isPublished: 1, featured: 1, displayOrder: 1 });
GallerySchema.index({ isPublished: 1, category: 1, displayOrder: 1 });
GallerySchema.index({ title: 'text', description: 'text' });

export const GalleryModel = mongoose.model<IGalleryDocument>('Gallery', GallerySchema);
