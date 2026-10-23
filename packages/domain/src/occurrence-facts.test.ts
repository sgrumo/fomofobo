import type { PriceScheme } from "models"
import { describe, expect, it } from "vitest"

import { occurrenceFactsOf } from "./occurrence-facts"

const priceScheme: PriceScheme = {
    isFree: false,
    fullPriceCents: 1000,
    reducedPrices: [],
    membership: null,
    minimumAge: null,
    notes: null,
}

// 19:00 to 21:30 UTC on Saturday the 24th is 21:00 to 23:30 in Rome.
const span = {
    startsAt: "2026-10-24T19:00:00.000Z",
    endsAt: "2026-10-24T21:30:00.000Z",
}

describe("occurrenceFactsOf", () => {
    it("lists the capacity and the interested count when the occurrence has them", () => {
        expect(
            occurrenceFactsOf(
                { ...span, priceScheme, capacity: 120, interestedCount: 34 },
                "it",
            ),
        ).toStrictEqual([
            { type: "date", weekdayDate: "sab 24/10" },
            { type: "time", start: "21:00", end: "23:30" },
            { type: "entry", priceScheme },
            { type: "capacity", places: 120 },
            { type: "interested", count: 34 },
        ])
    })

    it("leaves out a capacity that is not set and a count under the threshold", () => {
        expect(
            occurrenceFactsOf(
                { ...span, priceScheme, capacity: null, interestedCount: null },
                "it",
            ),
        ).toStrictEqual([
            { type: "date", weekdayDate: "sab 24/10" },
            { type: "time", start: "21:00", end: "23:30" },
            { type: "entry", priceScheme },
        ])
    })
})
