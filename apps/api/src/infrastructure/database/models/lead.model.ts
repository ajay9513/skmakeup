import mongoose, { Document, Schema } from 'mongoose';
import { LEAD_STAGES } from '@sk-makeup/shared';

export interface ILeadDocument extends Document {
  leadNumber: string;
  leadName: string;
  phone: string;
  email: string;
  source: string;
  stage: string;
  notes?: string;
  serviceReference?: mongoose.Types.ObjectId;
  packageReference?: mongoose.Types.ObjectId;
  eventDate?: Date;
  budget?: number;
  assignedTo?: mongoose.Types.ObjectId;
  contactMessageId?: mongoose.Types.ObjectId;
  convertedBookingId?: mongoose.Types.ObjectId;
  priority: string;
  lastContactedAt?: Date;
  convertedAt?: Date;
  lostReason?: string;
  tags: string[];
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILeadDocument>(
  {
    leadNumber: { type: String, required: true, unique: true },
    leadName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    source: {
      type: String,
      enum: ['website', 'contact_form', 'booking_form', 'whatsapp', 'referral', 'social', 'admin', 'other'],
      default: 'website',
    },
    stage: { type: String, enum: LEAD_STAGES, default: 'New', index: true },
    notes: { type: String },
    serviceReference: { type: Schema.Types.ObjectId, ref: 'Service' },
    packageReference: { type: Schema.Types.ObjectId, ref: 'Package' },
    eventDate: { type: Date },
    budget: { type: Number, min: 0 },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    contactMessageId: { type: Schema.Types.ObjectId, ref: 'ContactMessage' },
    convertedBookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    lastContactedAt: { type: Date },
    convertedAt: { type: Date },
    lostReason: { type: String },
    tags: [{ type: String, lowercase: true, trim: true }],
    ipAddress: { type: String },
  },
  { timestamps: true },
);

LeadSchema.index({ stage: 1, createdAt: -1 });
LeadSchema.index({ assignedTo: 1, stage: 1, updatedAt: -1 });
LeadSchema.index({ email: 1, createdAt: -1 });

export const LeadModel = mongoose.model<ILeadDocument>('Lead', LeadSchema);
