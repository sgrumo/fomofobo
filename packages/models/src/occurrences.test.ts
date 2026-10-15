import { describe, expect, it } from "vitest"

import { occurrenceLookupQuerySchema } from "./occurrences"

describe("occurrenceLookupQuerySchema", () => {
    it("reads one ref key from a URL query", () => {
        const ref = `${crypto.randomUUID()}:2026-10-14`

        expect(occurrenceLookupQuerySchema.parse({ ref })).toStrictEqual({ ref: [ref] })
    })

    it("rejects a ref key with no date", () => {
        expect(
            occurrenceLookupQuerySchema.safeParse({ ref: crypto.randomUUID() }).success,
        ).toBe(false)
    })
})
