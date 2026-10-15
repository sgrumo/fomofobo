"use client"

import { useParams } from "next/navigation"

import type { Route, RouteParameters, RouteQuery, RouteSegments } from "../routes.helper"
import { parseRouteParameters } from "../routes.helper"

/**
 * @description Returns the path parameters parsed by the route schema
 * @template TSegments Segment tuple type
 * @template TParameters Parameters type
 * @template TQuery Query type
 * @param route Route holding the parameter schema
 * @throws When the parameters fail the schema, through the not-found error Next raises
 */
export const useRouteParams = <
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
>(
    route: Route<TSegments, TParameters, TQuery>,
): TParameters => parseRouteParameters(route, useParams())
