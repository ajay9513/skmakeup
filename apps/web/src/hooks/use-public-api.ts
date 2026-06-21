import { useQuery, useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { queryKeys } from '@sk-makeup/shared';
import type { ListQueryInput } from '@sk-makeup/shared';
import { publicApi } from '@/lib/api';
import { STALE_TIMES } from '@/lib/query-client';

export function useSiteSettings() {
  return useQuery({
    queryKey: queryKeys.public.settings,
    queryFn: publicApi.getSiteSettings,
    staleTime: STALE_TIMES.settings,
  });
}

export function usePageContent(page: string) {
  return useQuery({
    queryKey: queryKeys.public.content(page),
    queryFn: () => publicApi.getPageContent(page),
    staleTime: STALE_TIMES.content,
  });
}

export function useSeo(page: string) {
  return useQuery({
    queryKey: queryKeys.public.seo(page),
    queryFn: () => publicApi.getSeo(page),
    staleTime: STALE_TIMES.seo,
  });
}

export function useServices(params?: Partial<ListQueryInput>) {
  return useQuery({
    queryKey: queryKeys.public.services(params),
    queryFn: () => publicApi.getServices(params),
    staleTime: STALE_TIMES.listings,
  });
}

export function useService(slug: string) {
  return useQuery({
    queryKey: queryKeys.public.service(slug),
    queryFn: () => publicApi.getService(slug),
    enabled: Boolean(slug),
    staleTime: STALE_TIMES.listings,
  });
}

export function usePackages() {
  return useQuery({
    queryKey: queryKeys.public.packages,
    queryFn: publicApi.getPackages,
    staleTime: STALE_TIMES.listings,
  });
}

export function usePortfolio(params?: Partial<ListQueryInput>) {
  return useQuery({
    queryKey: queryKeys.public.portfolio(params),
    queryFn: () => publicApi.getPortfolio(params),
    staleTime: STALE_TIMES.listings,
  });
}

export function useInfinitePortfolio(params?: Partial<ListQueryInput>) {
  return useInfiniteQuery({
    queryKey: queryKeys.public.portfolio({ ...params, infinite: true }),
    queryFn: ({ pageParam = 1 }) => publicApi.getPortfolio({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    staleTime: STALE_TIMES.listings,
  });
}

export function usePortfolioItem(slug: string) {
  return useQuery({
    queryKey: queryKeys.public.portfolioItem(slug),
    queryFn: () => publicApi.getPortfolioItem(slug),
    enabled: Boolean(slug),
    staleTime: STALE_TIMES.listings,
  });
}

export function useGallery(params?: Partial<ListQueryInput>) {
  return useQuery({
    queryKey: queryKeys.public.gallery(params),
    queryFn: () => publicApi.getGallery(params),
    staleTime: STALE_TIMES.listings,
  });
}

export function useInfiniteGallery(params?: Partial<ListQueryInput>) {
  return useInfiniteQuery({
    queryKey: queryKeys.public.gallery({ ...params, infinite: true }),
    queryFn: ({ pageParam = 1 }) => publicApi.getGallery({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    staleTime: STALE_TIMES.listings,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: queryKeys.public.testimonials,
    queryFn: publicApi.getTestimonials,
    staleTime: STALE_TIMES.listings,
  });
}

export function useTeamMembers() {
  return useQuery({
    queryKey: queryKeys.public.team,
    queryFn: publicApi.getTeamMembers,
    staleTime: STALE_TIMES.listings,
  });
}

export function useAvailableSlots(date: string) {
  return useQuery({
    queryKey: queryKeys.public.slots(date),
    queryFn: () => publicApi.getAvailableSlots(date),
    enabled: Boolean(date),
    staleTime: STALE_TIMES.slots,
    refetchInterval: STALE_TIMES.slots,
  });
}

export function usePortfolioPreview(token: string) {
  return useQuery({
    queryKey: ['public', 'portfolio', 'preview', token],
    queryFn: () => publicApi.getPortfolioPreview(token),
    enabled: Boolean(token),
    staleTime: 0,
  });
}

export function useSubmitBooking() {
  return useMutation({ mutationFn: publicApi.submitBooking });
}

export function useSubmitContact() {
  return useMutation({ mutationFn: publicApi.submitContact });
}
