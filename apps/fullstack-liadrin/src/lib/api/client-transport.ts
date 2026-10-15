import type { ApiRequest } from "api-client/client"
import { Result } from "shared/result"

import { buildTransportError } from "./transport-error"

/**
 * @description Builds the query string of a request, dropping every absent value
 * @param query Query object of the call
 * @remarks Repeats the key of a list value, which is how the routes read an array
 * @remarks Shared with the server transport, so both build the same string
 */
export const buildQueryString = (query: unknown): string => {
    if (typeof query !== "object" || query === null) {
        return ""
    }

    const params = new URLSearchParams(
        Object.entries(query).flatMap(([key, value]) =>
            Array.isArray(value)
                ? value
                      .filter(item => item !== undefined)
                      .map(item => [key, String(item)])
                : value === undefined
                  ? []
                  : [[key, String(value)]],
        ),
    )

    const serialized = params.toString()
    return serialized === "" ? "" : `?${serialized}`
}

/**
 * @description Sends the request to the API of this application over the same origin
 * @param request Method, path, query and body of the call
 * @throws When the API answers outside the `2xx` range
 * @remarks Runs in the browser only. The path already carries the `/api` prefix, so the
 * call needs no base URL and meets no CORS check
 */
export const clientTransport = async (request: ApiRequest): Promise<unknown> => {
    const response = await fetch(`${request.path}${buildQueryString(request.query)}`, {
        method: request.method.toUpperCase(),
        headers:
            request.body === undefined
                ? undefined
                : { "Content-Type": "application/json" },
        body: request.body === undefined ? undefined : JSON.stringify(request.body),
    })

    const body = await Result.tryAsync((): Promise<unknown> => response.json())
    const parsed = body.success ? body.value : undefined

    if (!response.ok) {
        throw buildTransportError(response.status, parsed)
    }

    return parsed
}
