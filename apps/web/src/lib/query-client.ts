import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60_000,
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export const STALE_TIMES = {
  settings: 5 * 60_000,
  content: 3 * 60_000,
  listings: 2 * 60_000,
  seo: 5 * 60_000,
  slots: 30_000,
} as const;
