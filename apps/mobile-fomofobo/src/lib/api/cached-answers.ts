import type { DataTag, DefaultError, QueryClient, QueryKey } from "@tanstack/react-query"
import { isEqual, maxBy, omit } from "es-toolkit"
import { z } from "zod"

const searchKeyVariablesSchema = z.object({ query: z.record(z.string(), z.unknown()) })

const SEARCH_CENTER_KEYS = ["lat", "lng"]

/**
 * @description Returns the data of the newest cached answer of the same kind as the query: the
 * same root and specifier of its key, and a key the predicate accepts
 * @template TData Data of the query
 * @param client Query client holding the cache
 * @param queryKey Key of the current query, which tags its data type
 * @param predicate Test of the key of a cached answer
 */
export const latestQueryData = <TData>(
    client: QueryClient,
    queryKey: DataTag<QueryKey, TData, DefaultError>,
    predicate: (cachedKey: QueryKey) => boolean,
): TData | undefined =>
    maxBy(
        client
            .getQueriesData<TData>({
                queryKey: queryKey.slice(0, 2),
                predicate: query => predicate(query.queryKey),
            })
            .flatMap(([cachedKey, data]) =>
                data === undefined
                    ? []
                    : [
                          {
                              data,
                              updatedAt:
                                  client.getQueryState(cachedKey)?.dataUpdatedAt ?? 0,
                          },
                      ],
            ),
        answer => answer.updatedAt,
    )?.data

/**
 * @description True when the cached search has the filters of the query, whatever its center
 * @param queryKey Key of a cached occurrence search
 * @param query Query of the current search
 */
export const isSameSearchFilters = (
    queryKey: QueryKey,
    query: Record<string, unknown>,
): boolean => {
    const variables = searchKeyVariablesSchema.safeParse(queryKey[2])
    return (
        variables.success &&
        isEqual(
            omit(variables.data.query, SEARCH_CENTER_KEYS),
            omit(query, SEARCH_CENTER_KEYS),
        )
    )
}
