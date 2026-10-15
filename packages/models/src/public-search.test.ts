import { describe, expect, it } from "vitest"

import { publicSearchQuerySchema } from "./public-search"

describe("publicSearchQuerySchema", () => {
    it("parses the values of a URL query string", () => {
        expect(
            publicSearchQuerySchema.parse({ lat: "44.3533", lng: "11.7147", q: "jazz" }),
        ).toStrictEqual({ lat: 44.3533, lng: 11.7147, q: "jazz", date: "default" })
    })

    it("accepts a complete range", () => {
        expect(
            publicSearchQuerySchema.safeParse({
                lat: "44.35",
                lng: "11.71",
                date: "range",
                from: "2026-10-14",
                to: "2026-10-18",
            }).success,
        ).toBe(true)
    })

    it("rejects a range with no end", () => {
        const result = publicSearchQuerySchema.safeParse({
            lat: "44.35",
            lng: "11.71",
            date: "range",
            from: "2026-10-14",
        })

        expect(result.error?.issues).toMatchObject([
            { code: "custom", params: { errorCode: "range-incomplete" } },
        ])
    })

    it("rejects a range that ends before it starts", () => {
        const result = publicSearchQuerySchema.safeParse({
            lat: "44.35",
            lng: "11.71",
            date: "range",
            from: "2026-10-14",
            to: "2026-10-13",
        })

        expect(result.error?.issues).toMatchObject([
            { code: "custom", params: { errorCode: "end-before-start" } },
        ])
    })
})
