import type { PriceScheme } from "models"
import { describe, expect, it } from "vitest"

import { priceDetailRows } from "./price-details"

const free: PriceScheme = {
    isFree: true,
    fullPriceCents: null,
    reducedPrices: [],
    membership: null,
    minimumAge: null,
    notes: null,
}

describe("priceDetailRows", () => {
    it("lists the full and the reduced prices, the card with its cost, the age and the notes", () => {
        expect(
            priceDetailRows({
                isFree: false,
                fullPriceCents: 1500,
                reducedPrices: [
                    { label: "Under 18", amountCents: 800 },
                    { label: "Soci", amountCents: 1000 },
                ],
                membership: { name: "Tessera ARCI", costCents: 1000 },
                minimumAge: 18,
                notes: "Prevendita online",
            }),
        ).toStrictEqual([
            { type: "full", cents: 1500 },
            { type: "reduced", index: 0, label: "Under 18", cents: 800 },
            { type: "reduced", index: 1, label: "Soci", cents: 1000 },
            { type: "membership", name: "Tessera ARCI", costCents: 1000 },
            { type: "minimum-age", age: 18 },
            { type: "notes", text: "Prevendita online" },
        ])
    })

    it("lists free entry with a card that has no cost", () => {
        expect(
            priceDetailRows({
                ...free,
                membership: { name: "Tessera ARCI", costCents: null },
            }),
        ).toStrictEqual([
            { type: "free" },
            { type: "membership", name: "Tessera ARCI", costCents: null },
        ])
    })

    it("lists no row when one row alone says what the summary says", () => {
        expect([
            priceDetailRows(free),
            priceDetailRows({ ...free, isFree: false, fullPriceCents: 1500 }),
            priceDetailRows({ ...free, isFree: false, notes: "Offerta libera" }),
        ]).toStrictEqual([[], [], []])
    })
})
