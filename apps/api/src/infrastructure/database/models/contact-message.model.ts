import mongoose, { Document, Schema } from 'mongoose';

export interface IContactMessageDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  leadId?: mongoose.Types.ObjectId;
  repliedAt?: Date;
  repliedBy?: mongoose.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessageDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new',
      index: true,
    },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    repliedAt: { type: Date },
    repliedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true },
);

ContactMessageSchema.index({ status: 1, createdAt: -1 });
ContactMessageSchema.index({ email: 1, createdAt: -1 });

export const ContactMessageModel = mongoose.model<IContactMessageDocument>(
  'ContactMessage',
  ContactMessageSchema,
);
