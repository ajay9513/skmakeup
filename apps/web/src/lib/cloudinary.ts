import { buildCloudinaryUrl, CLOUDINARY_PRESETS, type CloudinaryTransformOptions } from '@sk-makeup/shared';
import { getEnv } from './utils';
import type { CloudinaryImage } from './types';

const cloudName = getEnv('VITE_CLOUDINARY_CLOUD_NAME');

export function getCloudinaryUrl(
  image: Pick<CloudinaryImage, 'publicId'> | undefined | null,
  preset: keyof typeof CLOUDINARY_PRESETS = 'gallery',
  overrides?: CloudinaryTransformOptions,
): string | undefined {
  if (!image?.publicId || !cloudName) return undefined;
  return buildCloudinaryUrl(cloudName, image.publicId, { ...CLOUDINARY_PRESETS[preset], ...overrides });
}

export function getBlurPlaceholder(image: Pick<CloudinaryImage, 'publicId'> | undefined | null): string | undefined {
  if (!image?.publicId || !cloudName) return undefined;
  return buildCloudinaryUrl(cloudName, image.publicId, {
    width: 40,
    crop: 'fill',
    quality: 'auto:eco',
    format: 'auto',
  });
}

export function getSrcSet(
  image: Pick<CloudinaryImage, 'publicId'> | undefined | null,
  widths = [400, 800, 1200, 1600],
): string | undefined {
  if (!image?.publicId || !cloudName) return undefined;
  return widths
    .map((w) => `${buildCloudinaryUrl(cloudName, image.publicId, { width: w, crop: 'fill', format: 'auto', quality: 'auto:best' })} ${w}w`)
    .join(', ');
}
