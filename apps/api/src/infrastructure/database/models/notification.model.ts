import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationDocument extends Document {
  recipientId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: mongoose.Types.ObjectId;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  priority: string;
  expiresAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['booking_new', 'booking_status', 'lead_new', 'lead_converted', 'contact_new', 'system', 'media_upload'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: Schema.Types.ObjectId },
    actionUrl: { type: String },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    expiresAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const NotificationModel = mongoose.model<INotificationDocument>(
  'Notification',
  NotificationSchema,
);
