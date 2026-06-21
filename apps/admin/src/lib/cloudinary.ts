import { buildCloudinaryUrl, CLOUDINARY_PRESETS, CloudinaryTransformOptions } from '@sk-makeup/shared';
import { getEnv } from './utils';

const cloudName = getEnv('VITE_CLOUDINARY_CLOUD_NAME');

export function getCloudinaryImageUrl(
  publicId: string,
  preset: keyof typeof CLOUDINARY_PRESETS = 'adminGrid',
  overrides?: CloudinaryTransformOptions,
) {
  if (!cloudName) return '';
  return buildCloudinaryUrl(cloudName, publicId, { ...CLOUDINARY_PRESETS[preset], ...overrides });
}
