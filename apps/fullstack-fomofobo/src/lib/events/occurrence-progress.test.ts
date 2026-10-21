import { describe, expect, it } from "vitest"

import { occurrenceProgress } from "./occurrence-progress"

const occurrence = {
    startsAt: new Date("2026-10-17T19:00:00Z"),
    endsAt: new Date("2026-10-17T22:30:00Z"),
}

describe("occurrenceProgress", () => {
    it("returns the elapsed fraction of a live occurrence", () => {
        expect(occurrenceProgress(occurrence, new Date("2026-10-17T20:45:00Z"))).toBe(0.5)
    })

    it("clamps before the start and after the end", () => {
        expect([
            occurrenceProgress(occurrence, new Date("2026-10-17T18:00:00Z")),
            occurrenceProgress(occurrence, new Date("2026-10-18T00:00:00Z")),
        ]).toStrictEqual([0, 1])
    })
})
