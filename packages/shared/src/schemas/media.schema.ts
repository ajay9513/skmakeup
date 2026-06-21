import { z } from 'zod';
import { listQuerySchema, objectIdSchema } from './common.schema';

export const MEDIA_FOLDERS = [
  'branding',
  'services',
  'packages',
  'portfolio',
  'gallery',
  'testimonials',
  'team',
  'pages',
  'content',
  'settings',
  'seo',
  'temp',
] as const;

export const mediaListQuerySchema = listQuerySchema.extend({
  folder: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(['active', 'replaced', 'deleted']).optional(),
  isOrphan: z.coerce.boolean().optional(),
});

export const updateMediaSchema = z.object({
  alt: z.string().optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional(),
  folder: z.enum(MEDIA_FOLDERS).optional(),
});

export const replaceMediaSchema = z.object({
  mediaId: objectIdSchema,
});

export const linkMediaSchema = z.object({
  entityType: z.enum(['service', 'package', 'portfolio', 'gallery', 'testimonial', 'team_member', 'website_content', 'site_settings', 'seo']),
  entityId: objectIdSchema,
  entityField: z.string().optional(),
});

export type MediaListQueryInput = z.infer<typeof mediaListQuerySchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
export type LinkMediaInput = z.infer<typeof linkMediaSchema>;
