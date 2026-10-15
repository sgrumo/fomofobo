import { queryOptions } from "@tanstack/react-query"
import { ClientCompatibilityRoutes } from "api-routes"

import { cacheKeys } from "./cache-keys"
import { createEndpointFactories } from "./client"
import type { ApiClientOptions, QueryVariables } from "./client"

/**
 * @description Returns every request and its TanStack Query options, flat
 * @param options Transport and delay the endpoint factories bind to
 */
export const createApi = (options: ApiClientOptions) => {
    const { bodylessQueryEndpoint } = createEndpointFactories(options)

    // The platform and the version travel as headers, which the transport of each app
    // adds to every request. So the call itself takes no variable.
    const checkClientCompatibility = bodylessQueryEndpoint(
        ClientCompatibilityRoutes.check,
        200,
    )
    const checkClientCompatibilityQuery = (
        variables: QueryVariables<typeof ClientCompatibilityRoutes.check>,
    ) =>
        queryOptions({
            queryFn: () => checkClientCompatibility(variables),
            queryKey: cacheKeys.allClientCompatibility,
        })

    return {
        checkClientCompatibility,
        checkClientCompatibilityQuery,
    }
}

export type Api = ReturnType<typeof createApi>
