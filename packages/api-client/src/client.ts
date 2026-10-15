import type { z } from "@hono/zod-openapi"
import { mustTake } from "shared/function"
import type { Specified } from "shared/types"

export type ApiMethod = "get" | "query" | "post" | "put" | "patch" | "delete"

export interface ApiRequest {
    method: ApiMethod
    path: string
    query?: unknown
    body?: unknown
}

export interface ApiClientOptions {
    request: (request: ApiRequest) => Promise<unknown>
    getDelayMs?: () => number
}

interface ContentJsonSchema<T> {
    content: {
        "application/json": {
            schema: T
        }
    }
}

/**
 * @description Returns the schema a JSON content block declares
 * @template TContent Content block of a request body or of a response
 */
type JsonSchemaOf<TContent> =
    TContent extends ContentJsonSchema<infer TSchema extends z.ZodType> ? TSchema : never

/**
 * @description Returns the path params a route takes, empty when it declares none
 * @template TRequest Request section of a route definition
 * @remarks Returns an empty object for a params schema outside `string | number`
 */
type RouteParams<TRequest> =
    NonNullable<TRequest> extends { params: z.ZodType }
        ? z.infer<NonNullable<TRequest>["params"]> extends Record<string, string | number>
            ? z.infer<NonNullable<TRequest>["params"]>
            : Record<string, never>
        : Record<string, never>

/**
 * @description Returns the path with every `:param` segment replaced by its value
 * @param path Routing path holding `:param` segments
 * @param pathParams Values keyed by param name
 * @remarks Leaves a segment untouched when its value is absent
 */
const replaceRoutingPathParams = (
    path: string,
    pathParams: Partial<Record<string, string | number>>,
): string =>
    path.replaceAll(/:(?<paramName>\w+)/gu, (match, key) => {
        if (typeof key !== "string" && typeof key !== "number") {
            return match
        }
        const value = pathParams[key]
        return value === undefined ? match : encodeURIComponent(String(value))
    })

/**
 * @description Returns the params and the query a `get` route accepts
 * @template T Route definition read
 */
export interface QueryVariables<
    T extends {
        method: "get"
        request?: {
            params?: unknown
            query?: unknown
            headers?: unknown
        }
    },
> {
    params: RouteParams<T["request"]>
    query: NonNullable<T["request"]> extends { query: z.ZodType }
        ? Specified<z.infer<NonNullable<T["request"]>["query"]>, { mode: "shallow" }>
        : Record<string, never>
}

/**
 * @description Returns the params and the body a `query` route accepts
 * @template T Route definition read
 * @remarks Takes the `z.input` body type, so a defaulted criterion stays optional
 */
export interface BodyQueryVariables<
    T extends {
        method: "query"
        request: {
            params?: z.ZodType
            body: ContentJsonSchema<z.ZodType>
        }
    },
> {
    params: RouteParams<T["request"]>
    body: z.input<JsonSchemaOf<T["request"]["body"]>>
}

/**
 * @description Returns the endpoint factories bound to the transport
 * @param request Transport performing the HTTP call
 * @param getDelayMs Builder yielding the minimum call duration in milliseconds
 */
export const createEndpointFactories = ({ request, getDelayMs }: ApiClientOptions) => {
    const withMinimumDelay = <T>(fn: () => Promise<T>): Promise<T> =>
        mustTake(fn, { ms: getDelayMs?.() ?? 0 })

    /**
     * @description Returns a caller fetching the route and parsing the response
     * @template TResponseStatus Status code read
     * @template TResponseSchema Response schema type
     * @template TRoute Route definition type
     * @param route Route definition called
     * @param status Status code whose schema parses the response
     */
    const bodylessQueryEndpoint =
        <
            TResponseStatus extends number,
            TResponseSchema extends z.ZodType,
            TRoute extends {
                method: "get"
                getRoutingPath: () => string
                // A route can declare request headers. The transport of each app
                // supplies them, so they never reach the call variables.
                request?: {
                    params?: z.ZodType
                    query?: z.ZodType
                    headers?: z.ZodType
                }
                responses: Record<TResponseStatus, ContentJsonSchema<TResponseSchema>>
            },
        >(
            route: TRoute,
            status: TResponseStatus,
        ) =>
        ({
            params,
            query,
        }: QueryVariables<TRoute>): Promise<
            z.infer<JsonSchemaOf<TRoute["responses"][TResponseStatus]>>
        > =>
            withMinimumDelay(async () => {
                const data = await request({
                    method: route.method,
                    path: replaceRoutingPathParams(route.getRoutingPath(), params),
                    query,
                })
                return route.responses[status].content["application/json"].schema.parse(
                    data,
                )
            })

    /**
     * @description Returns a caller sending the criteria body and parsing the response
     * @template TResponseStatus Status code read
     * @template TResponseSchema Response schema type
     * @template TRoute Route definition type
     * @param route Route definition called
     * @param status Status code whose schema parses the response
     * @remarks Sends `QUERY`, so the read carries its criteria in the body
     */
    const bodyfulQueryEndpoint =
        <
            TResponseStatus extends number,
            TResponseSchema extends z.ZodType,
            TRoute extends {
                method: "query"
                getRoutingPath: () => string
                request: {
                    params?: z.ZodType
                    body: ContentJsonSchema<z.ZodType>
                }
                responses: Record<TResponseStatus, ContentJsonSchema<TResponseSchema>>
            },
        >(
            route: TRoute,
            status: TResponseStatus,
        ) =>
        ({
            params,
            body,
        }: BodyQueryVariables<TRoute>): Promise<
            z.infer<JsonSchemaOf<TRoute["responses"][TResponseStatus]>>
        > =>
            withMinimumDelay(async () => {
                const data = await request({
                    method: route.method,
                    path: replaceRoutingPathParams(route.getRoutingPath(), params),
                    body,
                })
                return route.responses[status].content["application/json"].schema.parse(
                    data,
                )
            })

    /**
     * @description Returns a caller sending the body and parsing the response
     * @template TResponseStatus Status code read
     * @template TResponseSchema Response schema type
     * @template TRoute Route definition type
     * @param route Route definition called
     * @param status Status code whose schema parses the response
     */
    const responsefulMutationEndpoint =
        <
            TResponseStatus extends number,
            TResponseSchema extends z.ZodType,
            TRoute extends {
                method: "post" | "put" | "patch"
                getRoutingPath: () => string
                request: {
                    params?: z.ZodType
                    body: ContentJsonSchema<z.ZodType>
                }
                responses: Record<TResponseStatus, ContentJsonSchema<TResponseSchema>>
            },
        >(
            route: TRoute,
            status: TResponseStatus,
        ) =>
        ({
            params,
            body,
        }: {
            params: RouteParams<TRoute["request"]>
            body: z.infer<JsonSchemaOf<TRoute["request"]["body"]>>
        }): Promise<z.infer<JsonSchemaOf<TRoute["responses"][TResponseStatus]>>> =>
            withMinimumDelay(async () => {
                const data = await request({
                    method: route.method,
                    path: replaceRoutingPathParams(route.getRoutingPath(), params),
                    body,
                })
                return route.responses[status].content["application/json"].schema.parse(
                    data,
                )
            })

    /**
     * @description Returns a caller sending the request and discarding the response
     * @template TRoute Route definition type
     * @param route Route definition called
     */
    const responselessMutationEndpoint =
        <
            TRoute extends {
                method: "post" | "put" | "patch" | "delete"
                getRoutingPath: () => string
                request?: {
                    params?: z.ZodType
                    body?: ContentJsonSchema<z.ZodType>
                }
            },
        >(
            route: TRoute,
        ) =>
        async ({
            params,
            body,
        }: {
            params: RouteParams<TRoute["request"]>
            body: NonNullable<TRoute["request"]> extends {
                body: ContentJsonSchema<z.ZodType>
            }
                ? z.infer<JsonSchemaOf<NonNullable<TRoute["request"]>["body"]>>
                : undefined
        }): Promise<void> => {
            await withMinimumDelay(() =>
                request({
                    method: route.method,
                    path: replaceRoutingPathParams(route.getRoutingPath(), params),
                    body,
                }),
            )
        }

    return {
        bodylessQueryEndpoint,
        bodyfulQueryEndpoint,
        responsefulMutationEndpoint,
        responselessMutationEndpoint,
    }
}

export type EndpointFactories = ReturnType<typeof createEndpointFactories>
