import type { Simplify } from "shared/types"
import { describe, expect, expectTypeOf, it } from "vitest"
import { z } from "zod"

import type {
    DynamicRoute,
    EmptyQuery,
    PathParameters,
    Route,
    RouteTitleArgs,
    RouteValues,
    StaticRoute,
    ValidSegments,
} from "./routes.helper"
import {
    createDynamicRoute,
    createRouteHandler,
    createStaticRoute,
    decodeRouteQuery,
    parseSegment,
} from "./routes.helper"

const title = () => "title"

describe("parseSegment", () => {
    it("should read a static segment", () => {
        expect(parseSegment("todos")).toStrictEqual({ type: "static", value: "todos" })
    })

    it("should read a parameter segment", () => {
        expect(parseSegment("[id]")).toStrictEqual({ type: "parameter", name: "id" })
    })

    it("should read a catch-all segment", () => {
        expect(parseSegment("[...slug]")).toStrictEqual({
            type: "catch-all",
            name: "slug",
        })
    })

    it("should read an optional catch-all segment", () => {
        expect(parseSegment("[[...slug]]")).toStrictEqual({
            type: "optional-catch-all",
            name: "slug",
        })
    })
})

describe("createStaticRoute", () => {
    const route = createStaticRoute({
        segments: ["todos", "[id]"],
        title,
        parametersSchema: z.object({ id: z.string() }),
        generateStaticParams: () => [{ id: "1" }, { id: "2" }],
    })

    it("should hold the static type and the empty query schema", () => {
        expect(route.type).toBe("static")
        expect(route.querySchema.decode({})).toStrictEqual({})
        expect(route.querySchema.safeDecode({ text: "milk" })).toMatchObject({
            success: true,
            data: {},
        })
    })

    it("should hold the `generateStaticParams` of the page", () => {
        expect(route.generateStaticParams()).toStrictEqual([{ id: "1" }, { id: "2" }])
    })

    it("should build the pathname with no search string", () => {
        expect(route.path({ parameters: { id: "a b" }, query: {} })).toBe("/todos/a%20b")
    })
})

describe("createDynamicRoute", () => {
    const route = createDynamicRoute({
        segments: ["todos", "[id]", "[...rest]"],
        title,
        parametersSchema: z.object({ id: z.string(), rest: z.array(z.string()) }),
        querySchema: z.object({
            pageSize: z.string().optional().catch(undefined),
            sort: z.string().default("asc").catch("asc"),
        }),
    })

    it("should hold the dynamic type", () => {
        expect(route.type).toBe("dynamic")
    })

    it("should fill and encode the bracket segments", () => {
        expect(
            route.path({ parameters: { id: "a b", rest: ["x", "y/z"] }, query: {} }),
        ).toBe("/todos/a%20b/x/y%2Fz?sort=asc")
    })

    it("should map the query keys to kebab case and drop the undefined values", () => {
        expect(
            route.path({
                parameters: { id: "1", rest: ["x"] },
                query: { pageSize: "5", sort: undefined },
            }),
        ).toBe("/todos/1/x?page-size=5&sort=asc")
    })

    it("should return no search string for an empty query schema", () => {
        const empty = createDynamicRoute({
            segments: [],
            title,
            parametersSchema: z.object({}),
            querySchema: z.object({}),
        })
        expect(empty.path({ parameters: {}, query: {} })).toBe("/")
    })

    it("should drop an optional catch-all segment with no value", () => {
        const optional = createDynamicRoute({
            segments: ["docs", "[[...slug]]"],
            title,
            parametersSchema: z.object({ slug: z.array(z.string()).optional() }),
            querySchema: z.object({}),
        })
        expect(optional.path({ parameters: {}, query: {} })).toBe("/docs")
        expect(optional.path({ parameters: { slug: ["a", "b"] }, query: {} })).toBe(
            "/docs/a/b",
        )
    })
})

describe("createRouteHandler", () => {
    it("should build the pathname", () => {
        const handler = createRouteHandler({ segments: ["api", "[[...route]]"] })
        expect(handler.path({ parameters: {} })).toBe("/api")
        expect(handler.path({ parameters: { route: ["todos", "1"] } })).toBe(
            "/api/todos/1",
        )
    })
})

describe("decodeRouteQuery", () => {
    const route = createDynamicRoute({
        segments: [],
        title,
        parametersSchema: z.object({}),
        querySchema: z.object({
            pageSize: z.string().optional().catch(undefined),
            text: z.string().optional().catch(undefined),
        }),
    })

    it("should keep the first value of a repeated key and map the key to camel case", () => {
        expect(
            decodeRouteQuery(route, [
                ["page-size", "5"],
                ["page-size", "10"],
                ["text", "milk"],
            ]),
        ).toStrictEqual({ pageSize: "5", text: "milk" })
    })

    it("should keep the first value of an array entry and drop an undefined entry", () => {
        expect(
            decodeRouteQuery(
                route,
                Object.entries({ text: ["milk", "eggs"], "page-size": undefined }),
            ),
        ).toStrictEqual({ text: "milk" })
    })
})

describe("types", () => {
    const staticRoute = createStaticRoute({
        segments: ["todos", "[id]"],
        title,
        parametersSchema: z.object({ id: z.string() }),
        generateStaticParams: () => [{ id: "1" }],
    })
    const dynamicRoute = createDynamicRoute({
        segments: ["todos"],
        title,
        parametersSchema: z.object({}),
        querySchema: z.object({ text: z.string().optional().catch(undefined) }),
    })

    it("should read the parameters from the segments", () => {
        expectTypeOf<PathParameters<[]>>().toEqualTypeOf<Record<string, never>>()
        expectTypeOf<PathParameters<["todos"]>>().toEqualTypeOf<Record<string, never>>()
        expectTypeOf<Simplify<PathParameters<["todos", "[id]"]>>>().toEqualTypeOf<{
            id: string
        }>()
        expectTypeOf<Simplify<PathParameters<["[a]", "[b]"]>>>().toEqualTypeOf<{
            a: string
            b: string
        }>()
        expectTypeOf<Simplify<PathParameters<["[...slug]"]>>>().toEqualTypeOf<{
            slug: string[]
        }>()
        expectTypeOf<Simplify<PathParameters<["docs", "[[...slug]]"]>>>().toEqualTypeOf<{
            slug?: string[]
        }>()
    })

    it("should narrow the parameters to the schema output", () => {
        const narrowRoute = createDynamicRoute({
            segments: ["[lang]", "[id]"],
            title,
            parametersSchema: z.object({ lang: z.enum(["en", "it"]), id: z.string() }),
            querySchema: z.object({}),
        })
        expectTypeOf<
            Parameters<typeof narrowRoute.path>[0]["parameters"]
        >().toEqualTypeOf<{
            lang: "en" | "it"
            id: string
        }>()
        const check = () => [
            narrowRoute.path({ parameters: { lang: "en", id: "1" }, query: {} }),
            // @ts-expect-error `xx` is not a value of the `lang` enum
            narrowRoute.path({ parameters: { lang: "xx", id: "1" }, query: {} }),
        ]
        expect(check).toBeTypeOf("function")
    })

    it("should accept the valid segments", () => {
        expectTypeOf<ValidSegments<[]>>().toEqualTypeOf<true>()
        expectTypeOf<ValidSegments<["todos", "search"]>>().toEqualTypeOf<true>()
        expectTypeOf<
            ValidSegments<["todos", "[id]", "[...rest]"]>
        >().toEqualTypeOf<true>()
        expectTypeOf<ValidSegments<["docs", "[[...slug]]"]>>().toEqualTypeOf<true>()
    })

    it("should reject the invalid segments", () => {
        expectTypeOf<ValidSegments<[""]>>().toEqualTypeOf<false>()
        expectTypeOf<ValidSegments<["todos/search"]>>().toEqualTypeOf<false>()
        expectTypeOf<ValidSegments<["[id"]>>().toEqualTypeOf<false>()
        expectTypeOf<ValidSegments<["id]"]>>().toEqualTypeOf<false>()
        expectTypeOf<ValidSegments<["[]"]>>().toEqualTypeOf<false>()
        expectTypeOf<ValidSegments<["[[...slug]]", "edit"]>>().toEqualTypeOf<false>()
    })

    it("should reject an invalid segment in the builders", () => {
        const staticArgs = {
            title,
            parametersSchema: z.object({}),
            generateStaticParams: () => [{}],
        }
        const dynamicArgs = {
            title,
            parametersSchema: z.object({}),
            querySchema: z.object({}),
        }
        const check = () => [
            // @ts-expect-error a segment holding `/`
            createStaticRoute({ ...staticArgs, segments: ["todos/search"] }),
            // @ts-expect-error an empty segment
            createStaticRoute({ ...staticArgs, segments: [""] }),
            // @ts-expect-error a malformed bracket segment
            createStaticRoute({ ...staticArgs, segments: ["[id"] }),
            // @ts-expect-error an optional catch-all before the last position
            createStaticRoute({ ...staticArgs, segments: ["[[...slug]]", "edit"] }),
            // @ts-expect-error a segment holding `/`
            createDynamicRoute({ ...dynamicArgs, segments: ["todos/search"] }),
            // @ts-expect-error an empty segment
            createDynamicRoute({ ...dynamicArgs, segments: [""] }),
            // @ts-expect-error a malformed bracket segment
            createDynamicRoute({ ...dynamicArgs, segments: ["[id"] }),
            // @ts-expect-error an optional catch-all before the last position
            createDynamicRoute({ ...dynamicArgs, segments: ["[[...slug]]", "edit"] }),
            createRouteHandler({
                // @ts-expect-error a segment holding `/`
                segments: ["auth/logout"],
            }),
        ]
        expect(check).toBeTypeOf("function")
    })

    it("should require a parameters schema matching the segments", () => {
        const staticArgs = { title, generateStaticParams: () => [] }
        const dynamicArgs = { title, querySchema: z.object({}) }
        const check = () => [
            createStaticRoute({
                ...staticArgs,
                segments: ["[id]"],
                // @ts-expect-error `id` is missing from the schema
                parametersSchema: z.object({}),
            }),
            createDynamicRoute({
                ...dynamicArgs,
                segments: ["[id]"],
                // @ts-expect-error `id` is missing from the schema
                parametersSchema: z.object({}),
            }),
            createDynamicRoute({
                ...dynamicArgs,
                segments: ["[id]"],
                // @ts-expect-error `id` is a string, not a number
                parametersSchema: z.object({ id: z.number() }),
            }),
        ]
        expect(check).toBeTypeOf("function")
    })

    it("should check `generateStaticParams` against the parameters schema", () => {
        const args = { title, parametersSchema: z.object({ lang: z.enum(["en", "it"]) }) }
        const check = () => [
            createStaticRoute({
                ...args,
                segments: ["[lang]"],
                generateStaticParams: () => [{ lang: "en" }, { lang: "it" }],
            }),
            createStaticRoute({
                ...args,
                segments: ["[lang]"],
                generateStaticParams: () =>
                    Promise.resolve<Array<{ lang: "en" | "it" }>>([{ lang: "en" }]),
            }),
            createStaticRoute({
                ...args,
                segments: ["[lang]"],
                // @ts-expect-error `xx` is not a value of the `lang` enum
                generateStaticParams: () => [{ lang: "xx" }],
            }),
            createStaticRoute({
                ...args,
                segments: ["[lang]"],
                // @ts-expect-error `lang` is missing
                generateStaticParams: () => [{}],
            }),
        ]
        expect(check).toBeTypeOf("function")
    })

    it("should give a static route no query schema of its own", () => {
        const check = () =>
            createStaticRoute({
                segments: ["todos"],
                title,
                parametersSchema: z.object({}),
                generateStaticParams: () => [{}],
                // @ts-expect-error a static route holds the empty query schema
                querySchema: z.object({}),
            })
        expect(check).toBeTypeOf("function")
    })

    it("should type the path arguments from the route", () => {
        const check = () => [
            staticRoute.path({ parameters: { id: "1" }, query: {} }),
            // @ts-expect-error `id` is missing
            staticRoute.path({ parameters: {}, query: {} }),
            // @ts-expect-error a static route holds no query key
            staticRoute.path({ parameters: { id: "1" }, query: { text: "milk" } }),
            dynamicRoute.path({ parameters: {}, query: { text: "milk" } }),
            // @ts-expect-error `other` is not a query key
            dynamicRoute.path({ parameters: {}, query: { other: "x" } }),
        ]
        expect(check).toBeTypeOf("function")
    })

    it("should type the route values from the schemas", () => {
        expectTypeOf<
            RouteValues<{ id: string }, Record<string, never>>["parameters"]
        >().toEqualTypeOf<{ id: string }>()
        expectTypeOf<
            RouteValues<Record<string, never>, Record<string, never>>["parameters"]
        >().toEqualTypeOf<Record<string, never>>()
    })

    it("should type the variant from the builder", () => {
        expectTypeOf(staticRoute.type).toEqualTypeOf<"static">()
        expectTypeOf(staticRoute.segments).toEqualTypeOf<readonly ["todos", "[id]"]>()
        expectTypeOf(staticRoute.generateStaticParams).returns.toEqualTypeOf<
            Array<{ id: string }> | Promise<Array<{ id: string }>>
        >()
        expectTypeOf(staticRoute.querySchema.decode({})).toEqualTypeOf<EmptyQuery>()
        expectTypeOf(dynamicRoute.type).toEqualTypeOf<"dynamic">()
        expectTypeOf(dynamicRoute.segments).toEqualTypeOf<readonly ["todos"]>()
        expectTypeOf(dynamicRoute.querySchema.decode({})).toEqualTypeOf<{
            text?: string | undefined
        }>()
    })

    it("should hand the title builder the translation and the parameters alone", () => {
        expectTypeOf<RouteTitleArgs<{ id: string }>>().toEqualTypeOf<{
            t: RouteTitleArgs<{ id: string }>["t"]
            parameters: { id: string }
        }>()
        const check = () =>
            createDynamicRoute({
                segments: ["todos"],
                title: args =>
                    // @ts-expect-error the title builder receives no query
                    String(args.query),
                parametersSchema: z.object({}),
                querySchema: z.object({ text: z.string().optional().catch(undefined) }),
            })
        expect(check).toBeTypeOf("function")
    })

    it("should read both variants as a route, and neither as the other", () => {
        expectTypeOf(staticRoute).toExtend<
            Route<readonly ["todos", "[id]"], { id: string }, EmptyQuery>
        >()
        expectTypeOf(staticRoute).toExtend<
            StaticRoute<readonly ["todos", "[id]"], { id: string }>
        >()
        expectTypeOf(staticRoute).not.toExtend<
            DynamicRoute<readonly ["todos", "[id]"], { id: string }, EmptyQuery>
        >()
        expectTypeOf(dynamicRoute).toExtend<
            Route<
                readonly ["todos"],
                Record<string, never>,
                { text?: string | undefined }
            >
        >()
        expectTypeOf(dynamicRoute).toExtend<
            DynamicRoute<
                readonly ["todos"],
                Record<string, never>,
                { text?: string | undefined }
            >
        >()
        expectTypeOf(dynamicRoute).not.toExtend<
            StaticRoute<readonly ["todos"], Record<string, never>>
        >()
    })
})
