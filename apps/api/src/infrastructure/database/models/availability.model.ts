import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeSlot {
  startTime: string;
  endTime: string;
  maxBookings: number;
}

export interface IAvailabilityDocument extends Document {
  type: 'weekly' | 'blocked_date' | 'override';
  dayOfWeek?: number;
  date?: Date;
  slots: ITimeSlot[];
  reason?: string;
  allDay: boolean;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema = new Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    maxBookings: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false },
);

const AvailabilitySchema = new Schema<IAvailabilityDocument>(
  {
    type: {
      type: String,
      enum: ['weekly', 'blocked_date', 'override'],
      required: true,
      index: true,
    },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    date: { type: Date, index: true },
    slots: { type: [TimeSlotSchema], default: [] },
    reason: { type: String },
    allDay: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

AvailabilitySchema.index({ type: 1, dayOfWeek: 1 }, { unique: true, partialFilterExpression: { type: 'weekly', isActive: true } });
AvailabilitySchema.index({ type: 1, date: 1 }, { unique: true, partialFilterExpression: { type: 'blocked_date', isActive: true } });

export const AvailabilityModel = mongoose.model<IAvailabilityDocument>(
  'Availability',
  AvailabilitySchema,
);
