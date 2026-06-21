import { Schema } from 'mongoose';

export const CloudinaryImageSchema = new Schema(
  {
    mediaAssetId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
    publicId: { type: String, required: true },
    secureUrl: { type: String, required: true },
    url: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    format: { type: String, required: true },
    bytes: { type: Number, required: true },
    alt: { type: String, default: '' },
    caption: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    folder: { type: String, required: true },
    version: { type: Number },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

export const SeoSnapshotSchema = new Schema(
  {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: [{ type: String }],
    canonicalUrl: { type: String },
    ogTitle: { type: String },
    ogDescription: { type: String },
    ogImage: { type: CloudinaryImageSchema },
    structuredData: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

export const SocialLinksSchema = new Schema(
  {
    instagram: { type: String },
    facebook: { type: String },
    tiktok: { type: String },
    youtube: { type: String },
    linkedin: { type: String },
    whatsapp: { type: String },
  },
  { _id: false },
);

export const BusinessHoursDaySchema = new Schema(
  {
    open: { type: String },
    close: { type: String },
    closed: { type: Boolean, default: false },
  },
  { _id: false },
);
