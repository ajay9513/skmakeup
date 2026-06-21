/** Client-side image file validation (Windows may omit MIME type). */
export const IMAGE_ACCEPT =
  'image/jpeg,image/png,image/webp,image/avif,image/gif,.jpg,.jpeg,.png,.webp,.gif,.avif';

const MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);
const EXT_PATTERN = /\.(jpe?g|png|webp|avif|gif)$/i;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function isAcceptedImageFile(file: File): boolean {
  if (file.size > MAX_IMAGE_BYTES) return false;
  if (MIME_TYPES.has(file.type)) return true;
  return EXT_PATTERN.test(file.name);
}

export function filterImageFiles(fileList: FileList | File[]): File[] {
  return Array.from(fileList).filter(isAcceptedImageFile);
}
