"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"

import type {
    DynamicRoute,
    RouteParameters,
    RouteQuery,
    RouteQuerySetter,
    RouteSegments,
} from "../routes.helper"
import { decodeRouteQuery } from "../routes.helper"
import { useRouteParams } from "./use-route-params"

/**
 * @description Returns the parsed query and its setter
 * @template TSegments Segment tuple type
 * @template TParameters Parameters type
 * @template TQuery Query type
 * @param route Dynamic route holding the query schema
 * @throws When the query fails the schema
 * @remarks The setter ignores an update holding no key
 * @remarks Every update writes the URL through `window.history`, which Next syncs into
 * `useSearchParams`. No Server Component runs again: the browser fetches the new data,
 * and `generateMetadata` keeps the title of the first load
 */
export const useRouteQuery = <
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
>(
    route: DynamicRoute<TSegments, TParameters, TQuery>,
): [TQuery, RouteQuerySetter<TQuery>] => {
    const pendingQueryRef = useRef<TQuery | undefined>(undefined)
    useEffect(() => {
        pendingQueryRef.current = undefined
    })

    const parameters = useRouteParams(route)
    const searchParams = useSearchParams()

    const query = decodeRouteQuery(route, searchParams.entries())

    const setQuery = (
        newPartialQuery: Partial<TQuery> | ((prev: TQuery) => Partial<TQuery>),
    ) => {
        const newPartialQueryNormalized =
            typeof newPartialQuery === "function"
                ? newPartialQuery(pendingQueryRef.current ?? query)
                : newPartialQuery
        if (Object.keys(newPartialQueryNormalized).length === 0) {
            return
        }

        const newCompleteQuery = {
            ...(pendingQueryRef.current ?? query),
            ...newPartialQueryNormalized,
        }
        pendingQueryRef.current = newCompleteQuery

        const href = route.path({ parameters, query: newCompleteQuery })
        if (pushesHistory(route, newPartialQueryNormalized)) {
            globalThis.history.pushState(null, "", href)
        } else {
            globalThis.history.replaceState(null, "", href)
        }
    }

    return [query, setQuery]
}

/**
 * @description True when one changed key asks for a history push
 * @template TSegments Segment tuple type
 * @template TParameters Parameters type
 * @template TQuery Query type
 * @param route Dynamic route holding the query options
 * @param update Query keys changed
 */
const pushesHistory = <
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
>(
    route: DynamicRoute<TSegments, TParameters, TQuery>,
    update: Partial<TQuery>,
): boolean =>
    Object.entries(route.queryOptions ?? {}).some(
        ([key, option]) => key in update && option?.push === true,
    )
