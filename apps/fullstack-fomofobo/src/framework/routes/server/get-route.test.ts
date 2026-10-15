import type { LanguageKey } from "i18n/i18n"
import { languageKeySchema } from "i18n/i18n"
import { describe, expect, expectTypeOf, it } from "vitest"
import { z } from "zod"

import { createDynamicRoute, createStaticRoute } from "../routes.helper"
import { getDynamicRoute } from "./get-dynamic-route"
import { getStaticRoute } from "./get-static-route"

const regionSchema = z.object({ lang: languageKeySchema, region: z.enum(["eu", "us"]) })

const catalogRoute = createStaticRoute({
    segments: ["[lang]", "[region]", "catalog"],
    title: ({ t }) => t("PageTitle.NotFound"),
    parametersSchema: regionSchema,
    generateStaticParams: () => [
        { lang: "en", region: "eu" },
        { lang: "en", region: "us" },
    ],
})

const shelvesRoute = createDynamicRoute({
    segments: ["[lang]", "[region]", "shelves"],
    title: ({ t }) => t("Language.Label"),
    parametersSchema: regionSchema,
    querySchema: z.object({}),
})

const bookSearchRoute = createDynamicRoute({
    segments: ["[lang]", "[region]", "books"],
    title: ({ t }) => t("Routes.Dev"),
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
})

const chapterStaticRoute = createStaticRoute({
    segments: ["[lang]", "books", "[isbn]", "chapters", "[chapter]"],
    title: ({ parameters }) => `Chapter ${parameters.chapter} of ${parameters.isbn}`,
    parametersSchema: z.object({
        lang: languageKeySchema,
        isbn: z.string(),
        chapter: z.string(),
    }),
    generateStaticParams: () => [{ lang: "en", isbn: "978-0", chapter: "1" }],
})

const chapterDynamicRoute = createDynamicRoute({
    segments: ["[lang]", "books", "[isbn]", "chapters", "[chapter]"],
    title: ({ parameters }) => `Chapter ${parameters.chapter} of ${parameters.isbn}`,
    parametersSchema: z.object({
        lang: languageKeySchema,
        isbn: z.string(),
        chapter: z.string(),
    }),
    querySchema: z.object({}),
})

describe("getStaticRoute", () => {
    it("should parse the parameters and build the path and the title", async () => {
        const values = await getStaticRoute(catalogRoute, {
            params: Promise.resolve({ lang: "en", region: "eu" }),
        })
        expect(values).toStrictEqual({
            parameters: { lang: "en", region: "eu" },
            path: "/en/eu/catalog",
            title: "Page not found",
        })
    })

    it("should translate the title in the language of the `lang` parameter", async () => {
        const values = await getStaticRoute(catalogRoute, {
            params: Promise.resolve({ lang: "it", region: "us" }),
        })
        expect(values.title).toBe("Pagina non trovata")
        expect(values.path).toBe("/it/us/catalog")
    })

    it("should accept only a static route", () => {
        const check = () => [
            getStaticRoute(chapterStaticRoute, {
                params: Promise.resolve({ lang: "en", isbn: "978-0", chapter: "1" }),
            }),
            // @ts-expect-error the route is dynamic, with or without query keys
            getStaticRoute(shelvesRoute, {
                params: Promise.resolve({ lang: "en", region: "eu" }),
            }),
        ]
        expect(check).toBeTypeOf("function")
    })
})

describe("getDynamicRoute", () => {
    it("should parse the parameters, decode the query, and build the path", async () => {
        const values = await getDynamicRoute(bookSearchRoute, {
            params: Promise.resolve({ lang: "en", region: "us" }),
            searchParams: Promise.resolve({
                author: "Calvino",
                sort: "year",
                available: ["yes"],
                other: "x",
            }),
        })

        expect(values).toStrictEqual({
            parameters: { lang: "en", region: "us" },
            query: { author: "Calvino", sort: "year", available: true },
            path: "/en/us/books?author=Calvino&sort=year&available=yes",
            title: "Dev",
        })
    })

    it("should translate the title in the language of the `lang` parameter", async () => {
        const values = await getDynamicRoute(chapterDynamicRoute, {
            params: Promise.resolve({ lang: "it", isbn: "978-0", chapter: "7" }),
            searchParams: Promise.resolve({}),
        })
        expect(values.path).toBe("/it/books/978-0/chapters/7")
        expect(values.title).toBe("Chapter 7 of 978-0")

        const shelves = await getDynamicRoute(shelvesRoute, {
            params: Promise.resolve({ lang: "it", region: "eu" }),
            searchParams: Promise.resolve({}),
        })
        expect(shelves.title).toBe("Lingua")
    })

    it("should accept only a dynamic route", () => {
        const check = () => [
            getDynamicRoute(chapterDynamicRoute, {
                params: Promise.resolve({ lang: "en", isbn: "978-0", chapter: "1" }),
                searchParams: Promise.resolve({}),
            }),
            // @ts-expect-error the route is static
            getDynamicRoute(catalogRoute, {
                params: Promise.resolve({ lang: "en", region: "eu" }),
                searchParams: Promise.resolve({}),
            }),
        ]
        expect(check).toBeTypeOf("function")
    })

    it("should type the values from the route", () => {
        const check = async () => {
            const values = await getDynamicRoute(chapterDynamicRoute, {
                params: Promise.resolve({ lang: "en", isbn: "978-0", chapter: "1" }),
                searchParams: Promise.resolve({}),
            })
            expectTypeOf(values).toEqualTypeOf<{
                parameters: { lang: LanguageKey; isbn: string; chapter: string }
                query: Record<string, never>
                path: string
                title: string
            }>()
        }
        expect(check).toBeTypeOf("function")
    })
})
