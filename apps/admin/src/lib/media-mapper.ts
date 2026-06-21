import type { CloudinaryImageInput } from '@sk-makeup/shared';
import type { MediaItem } from '@/hooks/useMedia';

export function mediaToCloudinaryImage(item: MediaItem, order = 0): CloudinaryImageInput {
  return {
    mediaAssetId: item.id,
    publicId: item.publicId,
    secureUrl: item.secureUrl,
    url: item.url,
    width: item.width,
    height: item.height,
    format: item.format,
    bytes: item.size,
    alt: item.alt || '',
    caption: item.caption || undefined,
    order,
    isFeatured: false,
    folder: item.folder,
  };
}
