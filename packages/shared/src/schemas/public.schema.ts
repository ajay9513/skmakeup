import { z } from 'zod';
import { objectIdSchema } from './common.schema';

export const publicBookingSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  customerEmail: z.string().trim().toLowerCase().email(),
  customerPhone: z.string().trim().min(5).max(20),
  selectedService: z.union([objectIdSchema, z.literal('')]).optional().transform((v) => v || undefined),
  selectedPackage: z.union([objectIdSchema, z.literal('')]).optional().transform((v) => v || undefined),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bookingTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  notes: z.string().max(1000).optional(),
  website: z.string().max(0).optional(),
}).refine((d) => d.selectedService || d.selectedPackage, {
  message: 'Please select a service or package',
});

export const publicContactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(1).max(150),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional(),
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;
export type PublicContactInput = z.infer<typeof publicContactSchema>;
