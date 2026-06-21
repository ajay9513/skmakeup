import mongoose, { Document, Schema } from 'mongoose';
import { PORTFOLIO_CATEGORIES } from '@sk-makeup/shared';
import { CloudinaryImageSchema, SeoSnapshotSchema } from '../schemas/shared.schemas';

export interface IPortfolioItemDocument extends Document {
  title: string;
  slug: string;
  category: string;
  description?: string;
  featuredImage: Record<string, unknown>;
  galleryImages: Record<string, unknown>[];
  beforeImage?: Record<string, unknown>;
  afterImage?: Record<string, unknown>;
  tags: string[];
  serviceReference?: mongoose.Types.ObjectId;
  viewCount: number;
  featured: boolean;
  published: boolean;
  publishedAt?: Date;
  scheduledPublishAt?: Date;
  previewToken?: string;
  previewTokenExpiresAt?: Date;
  seo: Record<string, unknown>;
  seoId?: mongoose.Types.ObjectId;
  displayOrder: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioItemSchema = new Schema<IPortfolioItemDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, enum: PORTFOLIO_CATEGORIES, required: true, index: true },
    description: { type: String },
    featuredImage: { type: CloudinaryImageSchema, required: true },
    galleryImages: { type: [CloudinaryImageSchema], default: [] },
    beforeImage: { type: CloudinaryImageSchema },
    afterImage: { type: CloudinaryImageSchema },
    tags: [{ type: String, lowercase: true, trim: true }],
    serviceReference: { type: Schema.Types.ObjectId, ref: 'Service' },
    viewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
    scheduledPublishAt: { type: Date, index: true },
    previewToken: { type: String, index: true, sparse: true },
    previewTokenExpiresAt: { type: Date },
    seo: { type: SeoSnapshotSchema, default: {} },
    seoId: { type: Schema.Types.ObjectId, ref: 'Seo' },
    displayOrder: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

PortfolioItemSchema.index({ published: 1, featured: 1, publishedAt: -1 });
PortfolioItemSchema.index({ published: 1, category: 1, displayOrder: 1 });
PortfolioItemSchema.index({ serviceReference: 1, published: 1 });
PortfolioItemSchema.index({ tags: 1, published: 1 });
PortfolioItemSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const PortfolioItemModel = mongoose.model<IPortfolioItemDocument>(
  'PortfolioItem',
  PortfolioItemSchema,
);
