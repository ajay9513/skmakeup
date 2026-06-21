import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@sk-makeup/shared';
import { mediaApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/axios';

export function useMediaList(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: queryKeys.media.list(params),
    queryFn: async () => {
      const { data } = await mediaApi.list(params);
      return { items: data.data as MediaItem[], meta: data.meta };
    },
  });
}

export interface MediaItem {
  id: string;
  publicId: string;
  secureUrl: string;
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  folder: string;
  alt: string;
  caption: string;
  tags: string[];
  status: string;
  isOrphan: boolean;
  createdAt: string;
}

export function useMediaUpload(folder: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      files,
      alt,
      caption,
      onProgress,
    }: {
      files: File[];
      alt?: string;
      caption?: string;
      onProgress?: (pct: number) => void;
    }) => {
      if (files.length === 1) {
        const { data } = await mediaApi.upload(files[0], folder, { alt, caption }, onProgress);
        return [data.data];
      }
      const { data } = await mediaApi.uploadBulk(files, folder);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}

export function useMediaUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      mediaApi.update(id, data).then((r) => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.media.all }),
  });
}

export function useMediaDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaApi.delete(id).then((r) => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.media.all }),
  });
}

export function useMediaRestore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaApi.restore(id).then((r) => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.media.all }),
  });
}

export function useMediaReplace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      mediaApi.replace(id, file).then((r) => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.media.all }),
  });
}

export function useCrudList(key: readonly string[], apiList: (params?: Record<string, unknown>) => Promise<{ data: { data: unknown[]; meta?: unknown } }>, params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: async () => {
      const { data } = await apiList(params);
      return { items: data.data, meta: data.meta };
    },
  });
}

export function useCrudMutation<T>(
  invalidateKeys: readonly (readonly string[])[],
  mutationFn: (payload: T) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
    onError: (error) => {
      console.error(getErrorMessage(error));
    },
  });
}
