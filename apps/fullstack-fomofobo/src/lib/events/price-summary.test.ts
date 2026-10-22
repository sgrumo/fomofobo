import type { PriceScheme } from "models"
import { describe, expect, it } from "vitest"

import { formatEuroCents, priceSummaryParts } from "./price-summary"

const free: PriceScheme = {
    isFree: true,
    fullPriceCents: null,
    reducedPrices: [],
    membership: null,
    minimumAge: null,
    notes: null,
}

describe("formatEuroCents", () => {
    it("drops the decimals of a whole amount and keeps them otherwise", () => {
        expect([500, 1250, 123_400].map(formatEuroCents)).toStrictEqual([
            "5 €",
            "12,50 €",
            "1234 €",
        ])
    })
})

describe("priceSummaryParts", () => {
    it("reads free, with the card and the age after it", () => {
        expect(
            priceSummaryParts({
                ...free,
                membership: { name: "Tessera ARCI", costCents: null },
                minimumAge: 18,
            }),
        ).toStrictEqual([
            { type: "free" },
            { type: "membership" },
            { type: "minimum-age", age: 18 },
        ])
    })

    it("reads one amount as it is, and the lowest of several as a start", () => {
        expect([
            priceSummaryParts({ ...free, isFree: false, fullPriceCents: 1500 }),
            priceSummaryParts({
                ...free,
                isFree: false,
                fullPriceCents: 1500,
                reducedPrices: [{ label: "Under 18", amountCents: 800 }],
            }),
        ]).toStrictEqual([
            [{ type: "amount", cents: 1500 }],
            [{ type: "from", cents: 800 }],
        ])
    })

    it("reads the notes of a paid scheme with no amount", () => {
        expect(
            priceSummaryParts({ ...free, isFree: false, notes: "Offerta libera" }),
        ).toStrictEqual([{ type: "notes", text: "Offerta libera" }])
    })
})
