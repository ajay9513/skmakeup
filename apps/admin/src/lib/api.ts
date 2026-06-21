import { api, ApiResponse } from '@/lib/axios';
import { LoginInput } from '@sk-makeup/shared';
import { AuthTokensDto, AuthUserDto } from '@sk-makeup/shared';

export const authApi = {
  login: (data: LoginInput) =>
    api.post<ApiResponse<Omit<AuthTokensDto, 'refreshToken'>>>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<ApiResponse<AuthUserDto>>('/auth/me'),
};

export const dashboardApi = {
  stats: () => api.get<ApiResponse<Record<string, unknown>>>('/admin/dashboard/stats'),
};

export const mediaApi = {
  list: (params: Record<string, unknown>) =>
    api.get<ApiResponse<unknown[]>>('/admin/media', { params }),
  get: (id: string) => api.get<ApiResponse<unknown>>(`/admin/media/${id}`),
  upload: (
    file: File,
    folder: string,
    metadata?: { alt?: string; caption?: string; tags?: string[] },
    onProgress?: (pct: number) => void,
  ) => {
    const form = new FormData();
    form.append('file', file);
    if (metadata?.alt) form.append('alt', metadata.alt);
    if (metadata?.caption) form.append('caption', metadata.caption);
    if (metadata?.tags) form.append('tags', JSON.stringify(metadata.tags));
    return api.post<ApiResponse<unknown>>(`/admin/media/upload?folder=${encodeURIComponent(folder)}`, form, {
      onUploadProgress: onProgress
        ? (e) => {
            if (e.total) onProgress(Math.round((e.loaded * 100) / e.total));
          }
        : undefined,
    });
  },
  uploadBulk: (files: File[], folder: string) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return api.post<ApiResponse<unknown[]>>(`/admin/media/upload/bulk?folder=${encodeURIComponent(folder)}`, form);
  },
  update: (id: string, data: Record<string, unknown>) =>
    api.patch<ApiResponse<unknown>>(`/admin/media/${id}`, data),
  replace: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<ApiResponse<unknown>>(`/admin/media/${id}/replace`, form);
  },
  delete: (id: string) => api.delete<ApiResponse<unknown>>(`/admin/media/${id}`),
  restore: (id: string) => api.post<ApiResponse<unknown>>(`/admin/media/${id}/restore`),
};

function crudApi(base: string) {
  return {
    list: (params?: Record<string, unknown>) =>
      api.get<ApiResponse<unknown[]>>(`/admin/${base}`, { params }),
    get: (id: string) => api.get<ApiResponse<unknown>>(`/admin/${base}/${id}`),
    create: (data: unknown) => api.post<ApiResponse<unknown>>(`/admin/${base}`, data),
    update: (id: string, data: unknown) => api.patch<ApiResponse<unknown>>(`/admin/${base}/${id}`, data),
    delete: (id: string) => api.delete<ApiResponse<unknown>>(`/admin/${base}/${id}`),
  };
}

export const servicesApi = crudApi('services');
export const portfolioApi = {
  ...crudApi('portfolio'),
  reorderImages: (id: string, images: unknown[]) =>
    api.patch<ApiResponse<unknown>>(`/admin/portfolio/${id}/reorder-images`, { images }),
  duplicate: (id: string) => api.post<ApiResponse<unknown>>(`/admin/portfolio/${id}/duplicate`),
  regeneratePreviewToken: (id: string) => api.post<ApiResponse<{ previewToken: string; slug: string }>>(`/admin/portfolio/${id}/preview-token`),
};
export const galleryApi = {
  ...crudApi('gallery'),
  reorderImages: (id: string, images: unknown[]) =>
    api.patch<ApiResponse<unknown>>(`/admin/gallery/${id}/reorder-images`, { images }),
};
export const testimonialsApi = crudApi('testimonials');
export const teamMembersApi = crudApi('team-members');
export const websiteContentApi = {
  ...crudApi('website-content'),
  byPage: (page: string) => api.get<ApiResponse<unknown[]>>(`/admin/website-content/page/${page}`),
};
export const seoApi = crudApi('seo');
export const settingsApi = {
  get: () => api.get<ApiResponse<unknown>>('/admin/site-settings'),
  update: (data: unknown) => api.patch<ApiResponse<unknown>>('/admin/site-settings', data),
};
export const bookingsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<unknown[]>>('/admin/bookings', { params }),
  get: (id: string) => api.get<ApiResponse<unknown>>(`/admin/bookings/${id}`),
  updateStatus: (id: string, data: unknown) =>
    api.patch<ApiResponse<unknown>>(`/admin/bookings/${id}/status`, data),
};
export const availabilityApi = {
  getWeekly: () => api.get<ApiResponse<unknown[]>>('/admin/availability/weekly'),
  setWeekly: (data: unknown) => api.put<ApiResponse<unknown>>('/admin/availability/weekly', data),
  getBlocked: () => api.get<ApiResponse<unknown[]>>('/admin/availability/blocked'),
  addBlocked: (data: unknown) => api.post<ApiResponse<unknown>>('/admin/availability/blocked', data),
  removeBlocked: (id: string) => api.delete<ApiResponse<unknown>>(`/admin/availability/blocked/${id}`),
  getSlots: (date: string) => api.get<ApiResponse<unknown>>('/admin/availability/slots', { params: { date } }),
};
