import mongoose, { Document, Schema } from 'mongoose';
import { BOOKING_STATUSES } from '@sk-makeup/shared';

export interface IBookingDocument extends Document {
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  selectedService?: mongoose.Types.ObjectId;
  selectedPackage?: mongoose.Types.ObjectId;
  bookingDate: Date;
  bookingTime: string;
  notes?: string;
  status: string;
  rescheduledFrom?: Date;
  rescheduledTo?: Date;
  rescheduledFromTime?: string;
  rescheduledToTime?: string;
  adminNotes?: string;
  leadId?: mongoose.Types.ObjectId;
  source: string;
  ipAddress?: string;
  userAgent?: string;
  confirmedBy?: mongoose.Types.ObjectId;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBookingDocument>(
  {
    bookingNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    selectedService: { type: Schema.Types.ObjectId, ref: 'Service' },
    selectedPackage: { type: Schema.Types.ObjectId, ref: 'Package' },
    bookingDate: { type: Date, required: true, index: true },
    bookingTime: { type: String, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'pending',
      index: true,
    },
    rescheduledFrom: { type: Date },
    rescheduledTo: { type: Date },
    rescheduledFromTime: { type: String },
    rescheduledToTime: { type: String },
    adminNotes: { type: String },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    source: {
      type: String,
      enum: ['website', 'admin', 'whatsapp', 'phone'],
      default: 'website',
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    confirmedAt: { type: Date },
  },
  { timestamps: true },
);

BookingSchema.index({ status: 1, bookingDate: 1 });
BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ customerEmail: 1, createdAt: -1 });
BookingSchema.index({ bookingDate: 1, bookingTime: 1, status: 1 });
BookingSchema.index(
  { bookingDate: 1, bookingTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } },
  },
);

export const BookingModel = mongoose.model<IBookingDocument>('Booking', BookingSchema);
