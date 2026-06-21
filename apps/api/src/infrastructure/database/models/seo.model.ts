import mongoose, { Document, Schema } from 'mongoose';
import { CloudinaryImageSchema } from '../schemas/shared.schemas';

export interface ISeoDocument extends Document {
  scope: string;
  page?: string;
  slug?: string;
  entityType?: string;
  entityId?: mongoose.Types.ObjectId;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl?: string;
  robots: string;
  openGraph: {
    title?: string;
    description?: string;
    image?: Record<string, unknown>;
    type?: string;
    url?: string;
  };
  structuredData: Record<string, unknown>;
  hreflang?: Array<{ lang: string; url: string }>;
  isActive: boolean;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SeoSchema = new Schema<ISeoDocument>(
  {
    scope: { type: String, enum: ['global', 'page', 'entity'], required: true, index: true },
    page: {
      type: String,
      enum: ['homepage', 'about', 'contact', 'services', 'portfolio', 'packages', 'book', 'team', 'gallery'],
    },
    slug: { type: String, lowercase: true, trim: true },
    entityType: {
      type: String,
      enum: ['service', 'package', 'portfolio', 'gallery', 'team_member', 'testimonial'],
    },
    entityId: { type: Schema.Types.ObjectId },
    metaTitle: { type: String, required: true, maxlength: 70 },
    metaDescription: { type: String, required: true, maxlength: 160 },
    keywords: [{ type: String, lowercase: true, trim: true }],
    canonicalUrl: { type: String },
    robots: { type: String, default: 'index,follow' },
    openGraph: {
      title: { type: String },
      description: { type: String },
      image: { type: CloudinaryImageSchema },
      type: { type: String, default: 'website' },
      url: { type: String },
    },
    structuredData: { type: Schema.Types.Mixed, default: {} },
    hreflang: [{ lang: { type: String }, url: { type: String } }],
    isActive: { type: Boolean, default: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

SeoSchema.index({ entityType: 1, entityId: 1 }, { unique: true, sparse: true });
SeoSchema.index({ scope: 1, page: 1 });
SeoSchema.index({ metaTitle: 'text', metaDescription: 'text', keywords: 'text' });

export const SeoModel = mongoose.model<ISeoDocument>('Seo', SeoSchema);
