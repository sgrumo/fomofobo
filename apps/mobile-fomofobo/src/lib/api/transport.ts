import type { ApiRequest } from "api-client/client"
import { apiErrorSchema } from "models"
import type { ApiError } from "models"
import { Result } from "shared/result"

import { ApiResponseError } from "./api-response-error"

/**
 * @description Maps a query object to a URL search string
 * @param query Object holding the query parameters
 * @remarks Repeats the key for every item of an array value
 */
const toQueryString = (query: unknown): string => {
    const entries: Array<[string, unknown]> =
        typeof query === "object" && query !== null ? Object.entries(query) : []
    const params = entries
        .filter(([, value]) => value !== undefined)
        .flatMap(([key, value]): Array<[string, string]> =>
            Array.isArray(value)
                ? value.map((item: unknown): [string, string] => [key, String(item)])
                : [[key, String(value)]],
        )
    const search = new URLSearchParams(params).toString()
    return search === "" ? "" : `?${search}`
}

/**
 * @description Returns the API error of a response body
 * @param body Raw response body
 * @remarks Yields `undefined` for a body that does not match `apiErrorSchema`
 */
const apiErrorOf = (body: string): ApiError | undefined => {
    const json = Result.try((): unknown => JSON.parse(body))
    if (!json.success) {
        return undefined
    }
    const apiError = apiErrorSchema.safeParse(json.value)
    return apiError.success ? apiError.data : undefined
}

/**
 * @description Returns a runner executing an API request against the base URL
 * @param baseUrl Origin prefixed to every request path
 * @param clientHeaders Headers added to every request, such as the app platform
 * and the app version
 * @throws When the response status is outside the 2xx range
 * @remarks Yields `undefined` for an empty response body
 */
export const createApiRequest =
    (baseUrl: string, clientHeaders: Record<string, string> = {}) =>
    async ({ method, path, query, body }: ApiRequest): Promise<unknown> => {
        const response = await fetch(`${baseUrl}${path}${toQueryString(query)}`, {
            method: method.toUpperCase(),
            headers: { "Content-Type": "application/json", ...clientHeaders },
            body: body === undefined ? undefined : JSON.stringify(body),
        })

        const text = await response.text()

        if (!response.ok) {
            const apiError = apiErrorOf(text)
            throw new ApiResponseError(
                `${method.toUpperCase()} ${path} failed (${response.status})${apiError === undefined ? "" : `: ${apiError.message}`}`,
                { status: response.status, apiError },
            )
        }

        const data: unknown = text === "" ? undefined : JSON.parse(text)
        return data
    }
