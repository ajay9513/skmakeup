import mongoose, { Document, Schema } from 'mongoose';
import { CloudinaryImageSchema, SeoSnapshotSchema, SocialLinksSchema } from '../schemas/shared.schemas';

export interface ITeamMemberDocument extends Document {
  name: string;
  slug: string;
  designation: string;
  profileImage: Record<string, unknown>;
  description: string;
  shortDescription?: string;
  socialLinks: Record<string, unknown>;
  specialties: string[];
  experienceYears?: number;
  displayOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
  seo: Record<string, unknown>;
  seoId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMemberDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    designation: { type: String, required: true, trim: true },
    profileImage: { type: CloudinaryImageSchema, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    socialLinks: { type: SocialLinksSchema, default: {} },
    specialties: [{ type: String, trim: true }],
    experienceYears: { type: Number, min: 0 },
    displayOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: false, index: true },
    seo: { type: SeoSnapshotSchema, default: {} },
    seoId: { type: Schema.Types.ObjectId, ref: 'Seo' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

TeamMemberSchema.index({ isPublished: 1, displayOrder: 1 });
TeamMemberSchema.index({ name: 'text', designation: 'text', description: 'text' });

export const TeamMemberModel = mongoose.model<ITeamMemberDocument>('TeamMember', TeamMemberSchema);
