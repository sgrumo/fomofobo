import type { QueryClientConfig } from "@tanstack/react-query"

/**
 * @remarks Never refetches on its own, so a mutation must invalidate its queries. The
 * prefetch of a Server Component relies on it too: hydrated data stays fresh, so the
 * browser does not repeat the call the server already made
 */
export const queryClientDefaultOptions: QueryClientConfig["defaultOptions"] = {
    queries: {
        staleTime: Infinity,
        gcTime: Infinity,
        retry: 1,
        // Offline, the service worker answers from its cache or fails: a paused query would never ask it.
        networkMode: "always",
    },
}
