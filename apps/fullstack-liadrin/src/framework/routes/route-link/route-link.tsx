import Link from "next/link"
import type { ComponentProps } from "react"
import type { StrictOmit } from "shared/types"

import type { Route, RouteParameters, RouteQuery, RouteSegments } from "../routes.helper"

interface RouteLinkProps<
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
> extends StrictOmit<ComponentProps<typeof Link>, "href"> {
    route: Route<TSegments, TParameters, TQuery>
    parameters: TParameters
    query: Partial<TQuery>
}

export const RouteLink = <
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
>({
    route,
    parameters,
    query,
    ...props
}: RouteLinkProps<TSegments, TParameters, TQuery>) => (
    <Link href={route.path({ parameters, query })} {...props} />
)
