import type { OccurrenceRef } from "models"
import { describe, expect, it } from "vitest"

import { isSameSpotEntry, spotEntriesOf } from "./spot-entries"
import type { SpotEntry } from "./spot-entries"

const occurrenceAt = (eventId: string, venueId: string) => ({
    eventId,
    date: "2026-10-24",
    venue: { id: venueId },
})

describe("spotEntriesOf", () => {
    it("lists the occurrences of the venue in result order, then the permanent venue", () => {
        const results = {
            occurrences: [
                occurrenceAt("jazz", "chiostro"),
                occurrenceAt("cinema", "rocca"),
                occurrenceAt("poetry", "chiostro"),
            ],
            permanentVenues: [{ id: "rocca" }, { id: "chiostro" }],
        }

        expect(spotEntriesOf(results, "chiostro")).toStrictEqual([
            { type: "occurrence", occurrence: occurrenceAt("jazz", "chiostro") },
            { type: "occurrence", occurrence: occurrenceAt("poetry", "chiostro") },
            { type: "venue", venue: { id: "chiostro" } },
        ])
    })

    it("returns no entry for a venue outside the results", () => {
        expect(
            spotEntriesOf(
                { occurrences: [occurrenceAt("jazz", "chiostro")], permanentVenues: [] },
                "rocca",
            ),
        ).toStrictEqual([])
    })
})

describe("isSameSpotEntry", () => {
    const jazz: SpotEntry<OccurrenceRef, { id: string }> = {
        type: "occurrence",
        occurrence: { eventId: "jazz", date: "2026-10-24" },
    }
    const rocca: SpotEntry<OccurrenceRef, { id: string }> = {
        type: "venue",
        venue: { id: "rocca" },
    }

    it("matches the same occurrence and the same venue", () => {
        expect([
            isSameSpotEntry(jazz, {
                type: "occurrence",
                occurrence: { eventId: "jazz", date: "2026-10-24" },
            }),
            isSameSpotEntry(rocca, { type: "venue", venue: { id: "rocca" } }),
        ]).toStrictEqual([true, true])
    })

    it("tells apart another date, another kind and no entry", () => {
        expect([
            isSameSpotEntry(jazz, {
                type: "occurrence",
                occurrence: { eventId: "jazz", date: "2026-10-25" },
            }),
            isSameSpotEntry(jazz, rocca),
            isSameSpotEntry(rocca, undefined),
        ]).toStrictEqual([false, false, false])
    })
})
