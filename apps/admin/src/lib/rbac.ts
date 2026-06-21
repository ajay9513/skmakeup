import { PERMISSIONS, Role } from '@sk-makeup/shared';

export function hasPermission(role: Role | undefined, permission: keyof typeof PERMISSIONS): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export function canManageContent(role: Role | undefined): boolean {
  return hasPermission(role, 'MANAGE_CONTENT');
}

export function canDeleteContent(role: Role | undefined): boolean {
  return hasPermission(role, 'DELETE_CONTENT');
}

export function canUploadMedia(role: Role | undefined): boolean {
  return hasPermission(role, 'UPLOAD_MEDIA');
}

export function canManageSettings(role: Role | undefined): boolean {
  return hasPermission(role, 'MANAGE_SETTINGS');
}
