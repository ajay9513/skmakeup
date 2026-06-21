import { MEDIA_FOLDERS } from '@sk-makeup/shared';
import { BadRequestError } from '../domain/errors';

export function validateMediaFolder(folder: string | undefined): string {
  const value = (folder || 'temp').trim().toLowerCase();
  if (!MEDIA_FOLDERS.includes(value as (typeof MEDIA_FOLDERS)[number])) {
    throw new BadRequestError(
      `Invalid upload folder. Allowed: ${MEDIA_FOLDERS.join(', ')}`,
      'INVALID_MEDIA_FOLDER',
    );
  }
  return value;
}
