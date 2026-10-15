"use client"

import type {
    ClientDynamicRouteValues,
    DynamicRoute,
    RouteParameters,
    RouteQuery,
    RouteSegments,
} from "../routes.helper"
import { useRouteParams } from "./use-route-params"
import { useRouteQuery } from "./use-route-query"

/**
 * @description Returns the route values a dynamic page reads in the browser
 * @template TSegments Segment tuple type
 * @template TParameters Parameters type
 * @template TQuery Query type
 * @param route Dynamic route of the page, `routes[props.route]` in a client component
 * @remarks Reads the search parameters, so a prerendered page that calls it needs a
 * `Suspense` boundary or the production build fails
 */
export const useDynamicRoute = <
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
>(
    route: DynamicRoute<TSegments, TParameters, TQuery>,
): ClientDynamicRouteValues<TParameters, TQuery> => {
    const parameters = useRouteParams(route)
    const [query, setQuery] = useRouteQuery(route)

    return { parameters, query, setQuery }
}
