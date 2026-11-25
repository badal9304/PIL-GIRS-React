import { QueryClient } from '@tanstack/react-query';

/** One QueryClient per browser session. Sample data is generated locally, so it never goes stale on its own. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: Infinity, gcTime: 30 * 60 * 1000, refetchOnWindowFocus: false, retry: 1 },
      mutations: { retry: 0 },
    },
  });
}
