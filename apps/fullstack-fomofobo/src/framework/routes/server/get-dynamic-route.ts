import "server-only"
import { getTranslation } from "@/lib/i18n/server/translation"

import type {
    DynamicRoute,
    RouteParameters,
    RouteQuery,
    RouteSegments,
    ServerDynamicRouteValues,
} from "../routes.helper"
import { decodeRouteQuery, parseRouteParameters, routeLanguage } from "../routes.helper"

export interface RoutePageProps {
    params: Promise<object>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * @description Returns the route values a dynamic page reads on the server
 * @template TSegments Segment tuple type
 * @template TParameters Parameters type
 * @template TQuery Query type
 * @param route Dynamic route of the page
 * @param props Props Next hands the page and `generateMetadata`
 * @throws When the parameters fail the schema, through the not-found error Next raises
 * @remarks Reads the language from the parsed `lang` parameter, not from the request,
 * and the backoffice language for a backoffice route, which has none
 * @remarks Reads the search parameters, which are request data, so the page renders
 * per request
 * @remarks Runs on the first load and on a reload alone: `setQuery` writes the URL
 * through `window.history`, so a query change never renders the page again
 */
export const getDynamicRoute = async <
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
>(
    route: DynamicRoute<TSegments, TParameters, TQuery>,
    props: RoutePageProps,
): Promise<ServerDynamicRouteValues<TParameters, TQuery>> => {
    const [rawParameters, rawSearchParams] = await Promise.all([
        props.params,
        props.searchParams,
    ])
    const parameters = parseRouteParameters(route, rawParameters)
    const query = decodeRouteQuery(route, Object.entries(rawSearchParams))

    return {
        parameters,
        query,
        path: route.path({ parameters, query }),
        title: route.title({ t: getTranslation(routeLanguage(parameters)), parameters }),
    }
}
