import mongoose, { Document, Schema } from 'mongoose';

export interface IMediaAssetDocument extends Document {
  publicId: string;
  secureUrl: string;
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  folder: string;
  alt?: string;
  caption?: string;
  tags: string[];
  uploadedBy: mongoose.Types.ObjectId;
  entityType?: string;
  entityId?: mongoose.Types.ObjectId;
  entityField?: string;
  isOrphan: boolean;
  version: number;
  resourceType: string;
  status: string;
  replacedByPublicId?: string;
  originalFilename?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAssetDocument>(
  {
    publicId: { type: String, required: true, unique: true },
    secureUrl: { type: String, required: true },
    url: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    format: { type: String, required: true },
    size: { type: Number, required: true },
    folder: { type: String, required: true, index: true },
    alt: { type: String, default: '' },
    caption: { type: String, default: '' },
    tags: [{ type: String, lowercase: true, trim: true }],
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    entityType: {
      type: String,
      enum: ['service', 'package', 'portfolio', 'gallery', 'testimonial', 'team_member', 'website_content', 'site_settings', 'seo', 'temp'],
    },
    entityId: { type: Schema.Types.ObjectId },
    entityField: { type: String },
    isOrphan: { type: Boolean, default: true, index: true },
    version: { type: Number, default: 1 },
    resourceType: { type: String, default: 'image' },
    status: { type: String, enum: ['active', 'replaced', 'deleted'], default: 'active', index: true },
    replacedByPublicId: { type: String },
    originalFilename: { type: String },
  },
  { timestamps: true },
);

MediaAssetSchema.index({ entityType: 1, entityId: 1 });
MediaAssetSchema.index({ folder: 1, createdAt: -1 });
MediaAssetSchema.index({ isOrphan: 1, createdAt: -1 });
MediaAssetSchema.index({ tags: 1 });

export const MediaAssetModel = mongoose.model<IMediaAssetDocument>('MediaAsset', MediaAssetSchema);
