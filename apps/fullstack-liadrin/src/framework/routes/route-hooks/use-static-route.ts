"use client"

import type {
    ClientStaticRouteValues,
    RouteParameters,
    RouteSegments,
    StaticRoute,
} from "../routes.helper"
import { useRouteParams } from "./use-route-params"

/**
 * @description Returns the route values a prerendered page reads in the browser
 * @template TSegments Segment tuple type
 * @template TParameters Parameters type
 * @param route Static route of the page, `routes[props.route]` in a client component
 */
export const useStaticRoute = <
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
>(
    route: StaticRoute<TSegments, TParameters>,
): ClientStaticRouteValues<TParameters> => ({
    parameters: useRouteParams(route),
})
