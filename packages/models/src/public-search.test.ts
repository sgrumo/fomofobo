import { describe, expect, it } from "vitest"

import { publicSearchQuerySchema } from "./public-search"

const box = { west: "11.65", south: "44.3", east: "11.78", north: "44.4" }

describe("publicSearchQuerySchema", () => {
    it("parses the values of a URL query string", () => {
        expect(
            publicSearchQuerySchema.parse({
                west: "11.65",
                south: "44.3",
                east: "11.78",
                north: "44.4",
                q: "jazz",
            }),
        ).toStrictEqual({
            west: 11.65,
            south: 44.3,
            east: 11.78,
            north: 44.4,
            q: "jazz",
            date: "default",
        })
    })

    it("reads one category of a URL query as a list", () => {
        const categoryId = crypto.randomUUID()

        expect(
            publicSearchQuerySchema.parse({
                ...box,
                categoryIds: categoryId,
            }).categoryIds,
        ).toStrictEqual([categoryId])
    })

    it("accepts a complete range", () => {
        expect(
            publicSearchQuerySchema.safeParse({
                ...box,
                date: "range",
                from: "2026-10-14",
                to: "2026-10-18",
            }).success,
        ).toBe(true)
    })

    it("rejects a range with no end", () => {
        const result = publicSearchQuerySchema.safeParse({
            ...box,
            date: "range",
            from: "2026-10-14",
        })

        expect(result.error?.issues).toMatchObject([
            { code: "custom", params: { errorCode: "range-incomplete" } },
        ])
    })

    it("rejects a range that ends before it starts", () => {
        const result = publicSearchQuerySchema.safeParse({
            ...box,
            date: "range",
            from: "2026-10-14",
            to: "2026-10-13",
        })

        expect(result.error?.issues).toMatchObject([
            { code: "custom", params: { errorCode: "end-before-start" } },
        ])
    })
})
