import { describe, expect, it } from "vitest"

import { historyDatesOf } from "./venue-history"

describe("historyDatesOf", () => {
    it("returns one date for an event of one day", () => {
        expect(historyDatesOf({ firstDate: "2026-10-24", lastDate: "2026-10-24" })).toBe(
            "24/10/2026",
        )
    })

    it("returns the span of an event of several days", () => {
        expect(historyDatesOf({ firstDate: "2026-09-30", lastDate: "2026-10-24" })).toBe(
            "30/09/2026 → 24/10/2026",
        )
    })
})
