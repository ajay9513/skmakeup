import mongoose, { Document, Schema } from 'mongoose';
import { CloudinaryImageSchema } from '../schemas/shared.schemas';

export interface IWebsiteContentDocument extends Document {
  key: string;
  page: string;
  section: string;
  contentType: string;
  label: string;
  value: unknown;
  image?: Record<string, unknown>;
  locale: string;
  isVisible: boolean;
  displayOrder: number;
  metadata?: Record<string, unknown>;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteContentSchema = new Schema<IWebsiteContentDocument>(
  {
    key: { type: String, required: true, trim: true },
    page: {
      type: String,
      enum: ['homepage', 'about', 'contact', 'services', 'portfolio', 'packages', 'book', 'team', 'global'],
      required: true,
      index: true,
    },
    section: {
      type: String,
      enum: ['hero', 'footer', 'business_info', 'intro', 'cta', 'features', 'stats', 'banner', 'legal', 'custom'],
      required: true,
    },
    contentType: {
      type: String,
      enum: ['text', 'richtext', 'markdown', 'image', 'image_array', 'json', 'html'],
      required: true,
    },
    label: { type: String, required: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
    image: { type: CloudinaryImageSchema },
    locale: { type: String, default: 'en' },
    isVisible: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

WebsiteContentSchema.index({ key: 1, locale: 1 }, { unique: true });
WebsiteContentSchema.index({ page: 1, section: 1, displayOrder: 1 });
WebsiteContentSchema.index({ page: 1, isVisible: 1 });

export const WebsiteContentModel = mongoose.model<IWebsiteContentDocument>(
  'WebsiteContent',
  WebsiteContentSchema,
);
