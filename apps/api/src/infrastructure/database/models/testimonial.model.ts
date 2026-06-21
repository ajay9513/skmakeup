import mongoose, { Document, Schema } from 'mongoose';
import { CloudinaryImageSchema } from '../schemas/shared.schemas';

export interface ITestimonialDocument extends Document {
  clientName: string;
  clientRole?: string;
  content: string;
  rating: number;
  avatar?: Record<string, unknown>;
  serviceReference?: mongoose.Types.ObjectId;
  teamMemberReference?: mongoose.Types.ObjectId;
  isPublished: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonialDocument>(
  {
    clientName: { type: String, required: true, trim: true },
    clientRole: { type: String, trim: true },
    content: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    avatar: { type: CloudinaryImageSchema },
    serviceReference: { type: Schema.Types.ObjectId, ref: 'Service' },
    teamMemberReference: { type: Schema.Types.ObjectId, ref: 'TeamMember' },
    isPublished: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    displayOrder: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

TestimonialSchema.index({ isPublished: 1, isFeatured: 1, displayOrder: 1 });
TestimonialSchema.index({ content: 'text', clientName: 'text' });

export const TestimonialModel = mongoose.model<ITestimonialDocument>(
  'Testimonial',
  TestimonialSchema,
);
