import type { AxiosRequestConfig, AxiosResponse, Method } from "axios"
import axios from "axios"
import { mintAccessToken, publishedOidcIssuer } from "e2e-kit/containers"
import { publishedAppUrl } from "e2e-kit/env"
import { lazyAsync } from "shared/function"
import type { z } from "zod"

/**
 * @description Returns the access token every call of this worker carries
 * @throws When the lifecycle published no issuer, or the provider refuses a token
 * @remarks Mints once per worker and shares the promise; a failed mint is retried on
 * the next call instead of failing every case of the worker
 */
export const getE2eAccessToken = lazyAsync(() => mintAccessToken(publishedOidcIssuer()))

interface RouteConfig {
    method: string
    responses: Record<number, unknown>
}

/**
 * @description Returns the path params type of a route definition
 * @template T Route definition
 */
export type ApiParams<T> = T extends {
    request: { params: infer P }
}
    ? P extends z.ZodType
        ? z.infer<P>
        : never
    : never

/**
 * @description Returns the query params type of a route definition
 * @template T Route definition
 * @remarks Yields the `z.input` type, so a transformed param keeps its raw shape
 */
export type ApiQuery<T> = T extends {
    request: { query: infer Q }
}
    ? Q extends z.ZodType
        ? z.input<Q>
        : never
    : never

/**
 * @description Returns the JSON request body type of a route definition
 * @template T Route definition
 */
export type ApiBody<T> = T extends {
    request: { body: { content: { "application/json": { schema: infer B } } } }
}
    ? B extends z.ZodType
        ? z.infer<B>
        : never
    : never

/**
 * @description Returns the JSON response type of a route definition for one status
 * @template T Route definition
 * @template StatusCode Response status read
 */
export type ApiResponse<T, StatusCode extends number> = T extends {
    responses: Record<
        StatusCode,
        { content: { "application/json": { schema: infer R } } }
    >
}
    ? R extends z.ZodType
        ? z.infer<R>
        : never
    : never

/**
 * @description True when the value can serialize into a query string
 * @param value Candidate query param value
 */
const isAdmissibleQueryParam = (value: unknown): value is string | number | boolean =>
    typeof value === "string" || typeof value === "number" || typeof value === "boolean"

/**
 * @description Builds a query string, expanding a list value into repeated keys
 * @param params Query params serialized
 * @remarks Drops every value the query string cannot carry
 */
const paramsSerializer = (params: Record<string, unknown>) =>
    Object.entries(params)
        .flatMap(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
                return value.filter(isAdmissibleQueryParam).map(item => [key, item])
            } else if (isAdmissibleQueryParam(value)) {
                return [[key, value]]
            }
            return []
        })
        .reduce(
            (qs, [key, value]) =>
                `${qs}${encodeURIComponent(String(key))}=${encodeURIComponent(String(value))}&`,
            "",
        )
        .slice(0, -1)

/**
 * @description Sends the request and returns the response, whatever its status
 * @template D Request body type
 * @param config Axios request config, method included
 * @remarks Yields a synthetic response with status `0` on a network error
 */
const request = async <D>(
    config: AxiosRequestConfig<D> & { method: Method },
): Promise<AxiosResponse<unknown>> => {
    const client = axios.create({
        baseURL: publishedAppUrl(),
        validateStatus: () => true,
        paramsSerializer,
    })

    return await client.request<unknown>(config).catch(
        () =>
            ({
                status: 0,
                data: { error: "Network error" },
                config,
                statusText: "Network Error",
                headers: {},
            }) as AxiosResponse<unknown>,
    )
}

/**
 * @description Returns the path with every `{name}` and `:name` placeholder replaced
 * @param path Route path template
 * @param pathParams Values keyed by placeholder name
 * @remarks Leaves a placeholder untouched when no value matches it
 */
const buildUrl = (path: string, pathParams: Record<string, string | number>): string =>
    path
        .replaceAll(/\{(?<paramName>\w+)\}/gu, (_match, key: string) => {
            const value = pathParams[key]
            return value === undefined ? _match : value.toString()
        })
        .replaceAll(/:(?<paramName>\w+)/gu, (_match, key: string) => {
            const value = pathParams[key]
            return value === undefined ? _match : value.toString()
        })

interface HttpResponse<T extends RouteConfig, StatusCode extends keyof T["responses"]> {
    status: StatusCode
    data: ApiResponse<T, StatusCode & number>
}

/**
 * @description Returns the union of every response a route can answer with
 * @template T Route definition
 */
type ApiCallResponse<T extends RouteConfig> = {
    [K in keyof T["responses"]]: HttpResponse<T, K>
}[keyof T["responses"]]

/**
 * @description Returns the single params object a route call takes
 * @template T Route definition
 * @remarks Makes path params and body required as soon as the route declares them
 */
type ApiCallParams<T> = (ApiParams<T> extends never
    ? object
    : { pathParams: ApiParams<T> }) &
    (ApiQuery<T> extends never ? object : { queryParams?: ApiQuery<T> }) &
    (ApiBody<T> extends never ? object : { body: ApiBody<T> }) & {
        headers?: Record<string, string>
    }

/**
 * @description Returns a typed caller for the Hono route definition
 * @template T Route definition, with its routing path
 * @param route Route definition the caller targets
 * @example
 * ```typescript
 * import { ClientCompatibilityRoutes } from "api-routes"
 *
 * export const checkCompatibility = createApiCall(ClientCompatibilityRoutes.check)
 *
 * const res = await checkCompatibility({})
 * expectStatus(res, 200)
 * ```
 */
export const createApiCall =
    <T extends RouteConfig & { getRoutingPath: () => string }>(route: T) =>
    async (params: ApiCallParams<T>): Promise<ApiCallResponse<T>> => {
        const pathParams = "pathParams" in params ? params.pathParams : {}
        const queryParams = "queryParams" in params ? params.queryParams : undefined
        const body = "body" in params ? params.body : undefined
        const customHeaders = "headers" in params ? params.headers : undefined

        // The API refuses a call without a token, so every call carries the token of
        // the suite unless the case sets its own.
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getE2eAccessToken()}`,
            ...customHeaders,
        }

        const response = await request({
            method: route.method as Method,
            url: buildUrl(
                route.getRoutingPath(),
                pathParams as Record<string, string | number>,
            ),
            params: queryParams,
            data: body,
            headers,
        })

        return response as ApiCallResponse<T>
    }
