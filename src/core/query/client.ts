import { QueryClient } from "@tanstack/react-query";

/**
 * React Query setup — tuned for an offline-first app.
 *  - Long stale time: most data is local-first, refetch is rarely urgent.
 *  - Disabled refetchOnWindowFocus on RN (no real "focus" semantics anyway).
 *  - Retry once: failures usually mean offline; show stale data instead.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60,
      retry: 1,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 0
    }
  }
});
