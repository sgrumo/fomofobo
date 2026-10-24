import type { QueryKey, QueryState } from "@tanstack/react-query"
import { cacheKey, specifier } from "api-client/cache-keys"

const DAY_MS = 24 * 60 * 60 * 1000

export const PERSISTED_CACHE_MAX_AGE_MS = 30 * DAY_MS

const SEARCH_MAX_AGE_MS = 7 * DAY_MS

const PERSISTED_ROOTS = new Set<unknown>([
    cacheKey.publicOccurrences,
    cacheKey.publicVenues,
    cacheKey.categories,
])

/**
 * @description True when the device keeps the answer of the query for offline reads: a public
 * read of occurrences, venues or categories with data, a failed refetch included, a search of the
 * last seven days, never a place suggestion
 * @param query Query of the cache
 * @param now Current epoch milliseconds
 */
export const isPersistedQuery = (
    query: { queryKey: QueryKey; state: Pick<QueryState, "data" | "dataUpdatedAt"> },
    now: number,
): boolean => {
    const [root, kind] = query.queryKey
    if (query.state.data === undefined || !PERSISTED_ROOTS.has(root)) {
        return false
    }
    return (
        root !== cacheKey.publicOccurrences ||
        kind !== specifier.search ||
        now - query.state.dataUpdatedAt <= SEARCH_MAX_AGE_MS
    )
}
