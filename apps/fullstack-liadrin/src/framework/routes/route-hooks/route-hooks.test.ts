import { describe, expect, expectTypeOf, it } from "vitest"
import { z } from "zod"

import { createDynamicRoute, createStaticRoute } from "../routes.helper"
import { useDynamicRoute } from "./use-dynamic-route"
import { useStaticRoute } from "./use-static-route"

const title = () => "title"

const regionSchema = z.object({ region: z.enum(["eu", "us"]) })

const routes = {
    catalog: createStaticRoute({
        segments: ["[region]", "catalog"],
        title,
        parametersSchema: regionSchema,
        generateStaticParams: () => [{ region: "eu" }, { region: "us" }],
    }),
    shelves: createDynamicRoute({
        segments: ["[region]", "shelves"],
        title,
        parametersSchema: regionSchema,
        querySchema: z.object({}),
    }),
    bookSearch: createDynamicRoute({
        segments: ["[region]", "books"],
        title,
        parametersSchema: regionSchema,
        querySchema: z.object({
            author: z.string().min(1).optional().catch(undefined),
            sort: z.enum(["title", "year"]).default("title").catch("title"),
            available: z
                .codec(z.literal("yes").optional(), z.literal(true).optional(), {
                    decode: value => (value === undefined ? undefined : true),
                    encode: value => (value === undefined ? undefined : "yes"),
                })
                .catch(undefined),
        }),
    }),
    book: createDynamicRoute({
        segments: ["books", "[isbn]", "[...chapters]"],
        title,
        parametersSchema: z.object({ isbn: z.string(), chapters: z.array(z.string()) }),
        querySchema: z.object({}),
    }),
} as const

interface RouteClientComponentProps<TKey extends keyof typeof routes> {
    route: TKey
}

interface BookSearchQuery {
    author?: string | undefined
    sort: "title" | "year"
    available?: true | undefined
}

describe("useDynamicRoute", () => {
    it("should type the values from the route", () => {
        const useCheck = () => {
            const search = useDynamicRoute(routes.bookSearch)
            expectTypeOf(search.query).toEqualTypeOf<BookSearchQuery>()
            expectTypeOf(search.setQuery)
                .parameter(0)
                .toEqualTypeOf<
                    | Partial<BookSearchQuery>
                    | ((prev: BookSearchQuery) => Partial<BookSearchQuery>)
                >()
            expectTypeOf(useDynamicRoute(routes.book).parameters).toEqualTypeOf<{
                isbn: string
                chapters: string[]
            }>()
        }
        expect(useCheck).toBeTypeOf("function")
    })

    it("should type the values from the route of the `route` prop", () => {
        const useCheck = (props: RouteClientComponentProps<"bookSearch">) => {
            const search = useDynamicRoute(routes[props.route])
            expectTypeOf(search.parameters).toEqualTypeOf<{ region: "eu" | "us" }>()
            expectTypeOf(search.query).toEqualTypeOf<BookSearchQuery>()
        }
        expect(useCheck).toBeTypeOf("function")
    })

    it("should accept only a dynamic route", () => {
        const useCheck = (props: RouteClientComponentProps<"catalog">) => [
            useDynamicRoute(routes.shelves),
            // @ts-expect-error the route is static
            useDynamicRoute(routes.catalog),
            // @ts-expect-error the route of the prop is static
            useDynamicRoute(routes[props.route]),
        ]
        expect(useCheck).toBeTypeOf("function")
    })
})

describe("useStaticRoute", () => {
    it("should type the parameters from the route of the `route` prop", () => {
        const useCheck = (props: RouteClientComponentProps<"catalog">) => {
            expectTypeOf(useStaticRoute(routes[props.route]).parameters).toEqualTypeOf<{
                region: "eu" | "us"
            }>()
        }
        expect(useCheck).toBeTypeOf("function")
    })

    it("should accept only a static route", () => {
        const useCheck = () => [
            // @ts-expect-error the route is dynamic
            useStaticRoute(routes.shelves),
        ]
        expect(useCheck).toBeTypeOf("function")
    })
})
