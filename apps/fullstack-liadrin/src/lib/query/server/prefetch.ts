import "server-only"
import type { DehydratedState, QueryClient } from "@tanstack/react-query"
import { dehydrate } from "@tanstack/react-query"

import { buildServerQueryClient } from "./query-client"

/**
 * @description Fetches the queries of one page on the server and returns the state to
 * hydrate
 * @param prefetch Runner calling `prefetchQuery` for every query of the page
 * @remarks Passes the client instead of a query list, so every call keeps the types of
 * its own endpoint
 * @remarks Every runner settles its queries instead of racing them, so one failure
 * never hides the results of the others. A failed query stays absent from the state,
 * and the browser fetches it again
 */
export const prefetchQueries = async (
    prefetch: (queryClient: QueryClient) => Promise<unknown>,
): Promise<DehydratedState> => {
    const queryClient = buildServerQueryClient()

    await prefetch(queryClient)

    return dehydrate(queryClient)
}
