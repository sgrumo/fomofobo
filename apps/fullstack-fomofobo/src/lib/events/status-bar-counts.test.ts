import { describe, expect, it } from "vitest"

import { statusBarCounts } from "./status-bar-counts"

describe("statusBarCounts", () => {
    const now = new Date("2026-10-14T19:47:00Z")

    it("counts live occurrences and the upcoming ones of today in the platform zone", () => {
        const occurrences = [
            { startsAt: "2026-10-14T19:00:00Z", endsAt: "2026-10-14T22:30:00Z" },
            { startsAt: "2026-10-14T18:00:00Z", endsAt: "2026-10-14T20:00:00Z" },
            { startsAt: "2026-10-14T20:30:00Z", endsAt: "2026-10-14T21:30:00Z" },
            { startsAt: "2026-10-14T17:00:00Z", endsAt: "2026-10-14T18:00:00Z" },
            { startsAt: "2026-10-15T08:00:00Z", endsAt: "2026-10-15T10:00:00Z" },
        ]

        expect(statusBarCounts(occurrences, now, "Europe/Rome")).toStrictEqual({
            live: 2,
            upcomingToday: 1,
        })
    })

    it("reads today in the zone, not in UTC", () => {
        // 22:30 UTC on the 14th is 00:30 on the 15th in Rome.
        const occurrences = [
            { startsAt: "2026-10-14T22:30:00Z", endsAt: "2026-10-14T23:30:00Z" },
        ]

        expect(statusBarCounts(occurrences, now, "Europe/Rome")).toStrictEqual({
            live: 0,
            upcomingToday: 0,
        })
        expect(statusBarCounts(occurrences, now, "UTC")).toStrictEqual({
            live: 0,
            upcomingToday: 1,
        })
    })
})
