import { camelCase, kebabCase, omitBy } from "es-toolkit"
import type { LanguageKey } from "i18n/i18n"
import { notFound } from "next/navigation"
import type { UseNamespacedTranslation } from "react-i18n/types"
import { isDefined } from "shared/values"
import { match } from "ts-pattern"
import type { ZodType } from "zod"
import { z } from "zod"

export type RouteSegments = readonly string[]

export type RouteParameters = Record<string, unknown>

export type LocalizedRouteParameters = RouteParameters & { lang: LanguageKey }

export type RouteQuery = Record<string, unknown>

export type EmptyQuery = Record<string, never>

export type RouteType = "static" | "dynamic"

/**
 * @remarks Holds no query: the server builds the title on the first load alone, and a
 * query change through `setQuery` never reaches it
 */
export interface RouteTitleArgs<TParameters extends RouteParameters> {
    t: UseNamespacedTranslation<"shared">
    parameters: TParameters
}

export interface Route<
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
> {
    type: RouteType
    segments: TSegments
    path: (args: { parameters: TParameters; query: Partial<TQuery> }) => string
    parametersSchema: ZodType<TParameters>
    querySchema: ZodType<TQuery, Partial<Record<string, string>>>
    title: (args: RouteTitleArgs<TParameters>) => string
}

export interface StaticRoute<
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
> extends Route<TSegments, TParameters, EmptyQuery> {
    type: "static"
    generateStaticParams: () => TParameters[] | Promise<TParameters[]>
}

export interface DynamicRoute<
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
> extends Route<TSegments, TParameters, TQuery> {
    type: "dynamic"
    queryOptions?: Partial<Record<keyof TQuery, QueryParameterOption>>
}

export interface RouteHandler<TSegments extends RouteSegments> {
    segments: TSegments
    path: (args: { parameters: PathParameters<TSegments> }) => string
}

interface SegmentsArg<TSegments extends RouteSegments> {
    segments: ValidSegments<TSegments> extends true ? TSegments : never
}

interface RouteArgs<
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
>
    extends
        SegmentsArg<TSegments>,
        Pick<Route<TSegments, TParameters, TQuery>, "parametersSchema" | "title"> {}

interface StaticRouteArgs<
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
> extends RouteArgs<TSegments, TParameters, EmptyQuery> {
    generateStaticParams: () =>
        | Array<NoInfer<TParameters>>
        | Promise<Array<NoInfer<TParameters>>>
}

interface DynamicRouteArgs<
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
>
    extends
        RouteArgs<TSegments, TParameters, TQuery>,
        Pick<
            DynamicRoute<TSegments, TParameters, TQuery>,
            "querySchema" | "queryOptions"
        > {}

/**
 * @description Builds a static route: prerendered, with no query, one instance per item of
 * `generateStaticParams`
 * @template TSegments Segment tuple type
 * @template TParameters Parameters type, read from the parameters schema, `const` so a
 * literal returned by `generateStaticParams` keeps its type
 * @param args Segments with the title builder, the parameters schema and `generateStaticParams`
 * @remarks Rejects a segment holding `/`, an empty segment, a malformed bracket segment,
 * or an optional catch-all segment before the last position
 */
export const createStaticRoute = <
    const TSegments extends RouteSegments,
    const TParameters extends PathParameters<TSegments>,
>(
    args: StaticRouteArgs<TSegments, TParameters>,
): StaticRoute<TSegments, TParameters> => {
    const querySchema = z.object({})

    return {
        ...args,
        type: "static",
        querySchema,
        path: createPathBuilder(args.segments, querySchema),
    }
}

/**
 * @description Builds a dynamic route: rendered per request, with the query the schema decodes
 * @template TSegments Segment tuple type
 * @template TParameters Parameters type, read from the parameters schema
 * @template TQuery Query type, read from the query schema
 * @param args Segments with the title builder and the parameters and query schemas
 * @remarks Rejects the same segments `createStaticRoute` rejects
 */
export const createDynamicRoute = <
    const TSegments extends RouteSegments,
    TParameters extends PathParameters<TSegments>,
    TQuery extends RouteQuery,
>(
    args: DynamicRouteArgs<TSegments, TParameters, TQuery>,
): DynamicRoute<TSegments, TParameters, TQuery> => ({
    ...args,
    type: "dynamic",
    path: createPathBuilder(args.segments, args.querySchema),
})

/**
 * @description Builds a route handler holding its segments and a path builder
 * @template TSegments Segment tuple type
 * @param args Segments of the handler
 * @remarks Rejects the same segments `createStaticRoute` rejects
 */
export const createRouteHandler = <const TSegments extends RouteSegments>(
    args: SegmentsArg<TSegments>,
): RouteHandler<TSegments> => ({
    ...args,
    path: ({ parameters }) => buildPathname(args.segments, parameters),
})

/**
 * @description Builds the `path` function of a route from its segments and its query schema
 * @template TQuery Query type
 * @param segments Segments of the route
 * @param querySchema Schema encoding the query into the search string
 * @remarks Returns no search string when the default query fails to decode or to encode
 */
const createPathBuilder = <TQuery extends RouteQuery>(
    segments: RouteSegments,
    querySchema: ZodType<TQuery, Partial<Record<string, string>>>,
): ((args: { parameters: RouteParameters; query: Partial<TQuery> }) => string) => {
    const search = (query: Partial<TQuery>): string => {
        const defaultQuery = querySchema.safeDecode({})
        if (!defaultQuery.success) {
            return ""
        }

        // An undefined value asks for the default, so it must not shadow it.
        const encodedQuery = querySchema.safeEncode({
            ...defaultQuery.data,
            ...omitBy(query, value => value === undefined),
        })
        if (!encodedQuery.success) {
            return ""
        }

        return buildSearch(encodedQuery.data)
    }

    return ({ parameters, query }) =>
        `${buildPathname(segments, parameters)}${search(query)}`
}

export interface RouteValues<
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
> {
    parameters: TParameters
    query: TQuery
}

/**
 * @description Returns the query setter type of the route
 * @template TQuery Query type
 */
export type RouteQuerySetter<TQuery extends RouteQuery> = (
    query: Partial<TQuery> | ((prev: TQuery) => Partial<TQuery>),
) => void

export interface ClientStaticRouteValues<TParameters extends RouteParameters> {
    parameters: TParameters
}

export interface ClientDynamicRouteValues<
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
> extends RouteValues<TParameters, TQuery> {
    setQuery: RouteQuerySetter<TQuery>
}

export interface ServerStaticRouteValues<TParameters extends RouteParameters> {
    parameters: TParameters
    path: string
    title: string
}

export interface ServerDynamicRouteValues<
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
> extends RouteValues<TParameters, TQuery> {
    path: string
    title: string
}

/**
 * @description Returns the path parameters parsed by the route schema
 * @template TSegments Segment tuple type
 * @template TParameters Parameters type
 * @template TQuery Query type
 * @param route Route holding the parameter schema
 * @param raw Parameters as Next hands them, from `useParams` or the `params` page prop
 * @throws When the parameters fail the schema, through the not-found error Next raises
 */
export const parseRouteParameters = <
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
>(
    route: Route<TSegments, TParameters, TQuery>,
    raw: unknown,
): TParameters => {
    const parsing = route.parametersSchema.safeParse(raw)
    if (!parsing.success) {
        notFound()
    }

    return parsing.data
}

/**
 * @description Returns the query decoded by the route schema
 * @template TSegments Segment tuple type
 * @template TParameters Parameters type
 * @template TQuery Query type
 * @param route Route holding the query schema
 * @param entries Query entries, from `URLSearchParams` or from the `searchParams` page prop
 * @throws When the query fails the schema
 * @remarks The server and the browser both call it, so both build the same variables
 * and the same cache key
 */
export const decodeRouteQuery = <
    TSegments extends RouteSegments,
    TParameters extends RouteParameters,
    TQuery extends RouteQuery,
>(
    route: Route<TSegments, TParameters, TQuery>,
    entries: Iterable<[string, string | string[] | undefined]>,
): TQuery => {
    const decoding = route.querySchema.safeDecode(rawQueryFromEntries(entries))
    if (!decoding.success) {
        throw new Error(
            `Route query does not match its schema: ${decoding.error.message}`,
        )
    }

    return decoding.data
}

export type ParsedSegment =
    | { type: "static"; value: string }
    | { type: "parameter"; name: string }
    | { type: "catch-all"; name: string }
    | { type: "optional-catch-all"; name: string }

const optionalCatchAllPattern = /^\[\[\.\.\.(?<name>[^\]]+)\]\]$/u
const catchAllPattern = /^\[\.\.\.(?<name>[^\]]+)\]$/u
const parameterPattern = /^\[(?<name>[^\]]+)\]$/u

/**
 * @description Returns the segment read in the Next bracket grammar
 * @param segment Segment read
 */
export const parseSegment = (segment: string): ParsedSegment => {
    const optionalCatchAll = optionalCatchAllPattern.exec(segment)?.groups?.name
    if (optionalCatchAll !== undefined) {
        return { type: "optional-catch-all", name: optionalCatchAll }
    }

    const catchAll = catchAllPattern.exec(segment)?.groups?.name
    if (catchAll !== undefined) {
        return { type: "catch-all", name: catchAll }
    }

    const parameter = parameterPattern.exec(segment)?.groups?.name
    if (parameter !== undefined) {
        return { type: "parameter", name: parameter }
    }

    return { type: "static", value: segment }
}

/**
 * @description Builds the pathname of the segments with the parameters filled in
 * @param segments Segments of the route
 * @param parameters Parameter record filling the bracket segments
 * @remarks Drops an optional catch-all segment with no value
 */
const buildPathname = (segments: RouteSegments, parameters: object): string => {
    const entries: Array<[string, unknown]> = Object.entries(parameters)
    const values = new Map(entries)

    const filled = segments
        .map(segment =>
            match(parseSegment(segment))
                .with({ type: "static" }, parsed => parsed.value)
                .with({ type: "parameter" }, parsed => {
                    const value = values.get(parsed.name)
                    return typeof value === "string"
                        ? encodeURIComponent(value)
                        : undefined
                })
                .with({ type: "catch-all" }, { type: "optional-catch-all" }, parsed =>
                    encodeCatchAll(values.get(parsed.name)),
                )
                .exhaustive(),
        )
        .filter(isDefined)

    return `/${filled.join("/")}`
}

/**
 * @description Returns the catch-all value as encoded segments joined by `/`
 * @param value Parameter value read
 */
const encodeCatchAll = (value: unknown): string | undefined =>
    Array.isArray(value)
        ? value
              .filter(item => typeof item === "string")
              .map(item => encodeURIComponent(item))
              .join("/")
        : undefined

/**
 * @description Builds the search string of the encoded query
 * @param query Encoded query, undefined values dropped, keys mapped to kebab case
 * @remarks Returns the empty string, not a bare `?`, when no query value is set
 */
const buildSearch = (query: Partial<Record<string, string>>): string => {
    const entries = Object.entries(query).flatMap(
        ([key, value]): Array<[string, string]> =>
            value === undefined ? [] : [[kebabCase(key), value]],
    )

    return entries.length === 0 ? "" : `?${new URLSearchParams(entries).toString()}`
}

/**
 * @description Builds the raw query the query schema decodes from URL entries
 * @param entries Query entries, from `URLSearchParams` or from the `searchParams` page prop
 * @remarks Keeps the first value of a repeated key, as `URLSearchParams.get` does, and
 * maps every key to camel case
 */
const rawQueryFromEntries = (
    entries: Iterable<[string, string | string[] | undefined]>,
): Partial<Record<string, string>> =>
    Array.from(entries).reduce<Partial<Record<string, string>>>((query, [key, value]) => {
        const first = typeof value === "string" ? value : value?.[0]
        if (first !== undefined) {
            query[camelCase(key)] ??= first
        }
        return query
    }, {})

/**
 * @description Returns the parameter record held by one segment
 * @template TSegment Segment read
 */
type SegmentParameters<TSegment extends string> = TSegment extends `[[...${infer TName}]]`
    ? { [K in TName]?: string[] }
    : TSegment extends `[...${infer TName}]`
      ? { [K in TName]: string[] }
      : TSegment extends `[${infer TName}]`
        ? { [K in TName]: string }
        : // TODO: replace the empty intersection seed with a type the rule accepts, then remove this directive
          // oxlint-disable-next-line typescript/no-generated-empty-object-type
          Record<never, never>

/**
 * @description Returns the intersection of the parameter records of every segment
 * @template TSegments Segments read
 * @template TAccumulated Parameter records already found
 */
type PathParametersImpl<
    TSegments extends RouteSegments,
    TAccumulated,
> = TSegments extends readonly [
    infer THead extends string,
    ...infer TTail extends RouteSegments,
]
    ? PathParametersImpl<TTail, TAccumulated & SegmentParameters<THead>>
    : TAccumulated

/**
 * @description Returns the record of bracket parameters held by the segments
 * @template TSegments Segments read
 * @remarks Types every parameter as widely as the segment grammar allows, so it is the
 * upper bound of a parameters schema output, not the output itself
 */
export type PathParameters<TSegments extends RouteSegments> = keyof PathParametersImpl<
    TSegments,
    // TODO: replace the empty intersection seed with a type the rule accepts, then remove this directive
    // oxlint-disable-next-line typescript/no-generated-empty-object-type
    Record<never, never>
> extends never
    ? Record<string, never>
    : // TODO: replace the empty intersection seed with a type the rule accepts, then remove this directive
      // oxlint-disable-next-line typescript/no-generated-empty-object-type
      PathParametersImpl<TSegments, Record<never, never>>

/**
 * @description True when the segment is a static value or a well formed bracket segment
 * @template TSegment Segment read
 */
type ValidSegment<TSegment extends string> = TSegment extends ""
    ? false
    : TSegment extends `${string}/${string}`
      ? false
      : TSegment extends `[[...${infer TName}]]`
        ? TName extends "" | `${string}]${string}`
            ? false
            : true
        : TSegment extends `[...${infer TName}]`
          ? TName extends "" | `${string}]${string}`
              ? false
              : true
          : TSegment extends `[${infer TName}]`
            ? TName extends "" | `${string}]${string}` | `${string}[${string}`
                ? false
                : true
            : TSegment extends `${string}[${string}` | `${string}]${string}`
              ? false
              : true

/**
 * @description True when every segment is valid and an optional catch-all sits last
 * @template TSegments Segments read
 */
export type ValidSegments<TSegments extends RouteSegments> = TSegments extends readonly [
    infer THead extends string,
    ...infer TTail extends RouteSegments,
]
    ? ValidSegment<THead> extends true
        ? THead extends `[[...${string}]]`
            ? TTail extends readonly []
                ? true
                : false
            : ValidSegments<TTail>
        : false
    : true

interface QueryParameterOption {
    push: boolean
}
