import { describe, expect, it } from "vitest"

import { occurrenceStatus } from "./occurrence-status"

const occurrence = {
    startsAt: new Date("2026-10-17T19:00:00Z"),
    endsAt: new Date("2026-10-17T22:30:00Z"),
}

describe("occurrenceStatus", () => {
    it("reads upcoming before the start", () => {
        expect(occurrenceStatus(occurrence, new Date("2026-10-17T18:59:59Z"))).toBe(
            "upcoming",
        )
    })

    it("reads live at the start instant", () => {
        expect(occurrenceStatus(occurrence, new Date("2026-10-17T19:00:00Z"))).toBe(
            "live",
        )
    })

    it("reads live between start and end", () => {
        expect(occurrenceStatus(occurrence, new Date("2026-10-17T21:00:00Z"))).toBe(
            "live",
        )
    })

    it("reads ended at the end instant", () => {
        expect(occurrenceStatus(occurrence, new Date("2026-10-17T22:30:00Z"))).toBe(
            "ended",
        )
    })

    it("reads live at 00:15 the next day for a 21:00 to 00:30 occurrence", () => {
        expect(occurrenceStatus(occurrence, new Date("2026-10-17T22:15:00Z"))).toBe(
            "live",
        )
    })
})
