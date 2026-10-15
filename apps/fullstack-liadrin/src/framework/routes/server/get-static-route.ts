import "server-only"
import { getTranslation } from "@/lib/i18n/server/translation"

import type {
    LocalizedRouteParameters,
    RouteSegments,
    ServerStaticRouteValues,
    StaticRoute,
} from "../routes.helper"
import { parseRouteParameters } from "../routes.helper"

export interface StaticRoutePageProps {
    params: Promise<object>
}

/**
 * @description Returns the route values a prerendered page reads on the server
 * @template TSegments Segment tuple type
 * @template TParameters Parameters type
 * @param route Static route of the page
 * @param props Props Next hands the page and `generateMetadata`, `params` alone
 * @throws When the parameters fail the schema, through the not-found error Next raises
 * @remarks Reads the language from the parsed `lang` parameter, not from the request
 * @remarks Reads no request, so the page stays prerendered
 */
export const getStaticRoute = async <
    TSegments extends RouteSegments,
    TParameters extends LocalizedRouteParameters,
>(
    route: StaticRoute<TSegments, TParameters>,
    props: StaticRoutePageProps,
): Promise<ServerStaticRouteValues<TParameters>> => {
    const parameters = parseRouteParameters(route, await props.params)
    const query = route.querySchema.decode({})

    return {
        parameters,
        path: route.path({ parameters, query }),
        title: route.title({ t: getTranslation(parameters.lang), parameters }),
    }
}
