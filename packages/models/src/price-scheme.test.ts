import { describe, expect, it } from "vitest"

import type { PriceScheme } from "./price-scheme"
import { priceSchemeSchema } from "./price-scheme"

const free: PriceScheme = {
    isFree: true,
    fullPriceCents: null,
    reducedPrices: [],
    membership: null,
    minimumAge: null,
    notes: null,
}

describe("priceSchemeSchema", () => {
    it("accepts a free event that needs a membership card and an age", () => {
        expect(
            priceSchemeSchema.safeParse({
                ...free,
                membership: { name: "Tessera ARCI", costCents: 1000 },
                minimumAge: 18,
            }).success,
        ).toBe(true)
    })

    it("accepts a paid event with a full price, with reduced prices, or with notes alone", () => {
        expect(
            [
                { ...free, isFree: false, fullPriceCents: 1500 },
                {
                    ...free,
                    isFree: false,
                    reducedPrices: [{ label: "Under 18", amountCents: 500 }],
                },
                { ...free, isFree: false, notes: "Offerta libera" },
            ].map(scheme => priceSchemeSchema.safeParse(scheme).success),
        ).toStrictEqual([true, true, true])
    })

    it("rejects a price on a free event", () => {
        const result = priceSchemeSchema.safeParse({ ...free, fullPriceCents: 1000 })

        expect(result.error?.issues).toMatchObject([
            {
                code: "custom",
                path: ["fullPriceCents"],
                params: { errorCode: "free-with-price" },
            },
        ])
    })

    it("rejects a paid event with no price, no reduced price and no notes", () => {
        const result = priceSchemeSchema.safeParse({ ...free, isFree: false })

        expect(result.error?.issues).toMatchObject([
            {
                code: "custom",
                path: ["fullPriceCents"],
                params: { errorCode: "paid-without-price" },
            },
        ])
    })
})
