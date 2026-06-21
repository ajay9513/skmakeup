export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'thumb' | 'scale' | 'fit';
  gravity?: 'auto' | 'face' | 'center';
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
}

export function buildCloudinaryUrl(
  cloudName: string,
  publicId: string,
  options: CloudinaryTransformOptions = {},
): string {
  const transforms: string[] = [];

  if (options.format) transforms.push(`f_${options.format}`);
  if (options.quality) transforms.push(`q_${options.quality}`);
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  if (options.gravity) transforms.push(`g_${options.gravity}`);

  const transformStr = transforms.length > 0 ? `${transforms.join(',')}/` : '';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}${publicId}`;
}

export const CLOUDINARY_PRESETS = {
  thumbnail: { width: 400, height: 500, crop: 'fill' as const, gravity: 'auto' as const, format: 'auto' as const, quality: 'auto:best' as const },
  gallery: { width: 800, crop: 'fill' as const, gravity: 'auto' as const, format: 'auto' as const, quality: 'auto:best' as const },
  hero: { width: 1920, height: 900, crop: 'fill' as const, gravity: 'auto' as const, format: 'auto' as const, quality: 'auto:best' as const },
  lightbox: { width: 1600, format: 'auto' as const, quality: 'auto:best' as const },
  avatar: { width: 200, height: 200, crop: 'thumb' as const, gravity: 'face' as const, format: 'auto' as const, quality: 'auto:best' as const },
  adminGrid: { width: 300, height: 300, crop: 'fill' as const, gravity: 'auto' as const, format: 'auto' as const, quality: 'auto:best' as const },
};
