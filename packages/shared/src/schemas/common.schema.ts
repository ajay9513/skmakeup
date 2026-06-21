import { z } from 'zod';

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  published: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional(),
  folder: z.string().optional(),
  tags: z.string().optional(),
});

export const cloudinaryImageSchema = z.object({
  mediaAssetId: objectIdSchema.optional(),
  publicId: z.string().min(1),
  secureUrl: z.string().url(),
  url: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  format: z.string().min(1),
  bytes: z.number().int().nonnegative(),
  alt: z.string().default(''),
  caption: z.string().optional(),
  order: z.number().int().nonnegative().default(0),
  isFeatured: z.boolean().default(false),
  folder: z.string().min(1),
  version: z.number().optional(),
});

export const seoSnapshotSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().url().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: cloudinaryImageSchema.optional(),
  structuredData: z.record(z.unknown()).optional(),
});

export type ListQueryInput = z.infer<typeof listQuerySchema>;
export type CloudinaryImageInput = z.infer<typeof cloudinaryImageSchema>;
