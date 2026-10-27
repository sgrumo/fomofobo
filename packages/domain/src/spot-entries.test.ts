import type { OccurrenceRef } from "models"
import { describe, expect, it } from "vitest"

import { isSameSpotEntry, spotEntriesOf } from "./spot-entries"
import type { SpotEntry } from "./spot-entries"

const coordinatesOf: Record<string, { latitude: number; longitude: number }> = {
    chiostro: { latitude: 44.3533, longitude: 11.7147 },
    loggia: { latitude: 44.35331, longitude: 11.71472 },
    rocca: { latitude: 44.3633, longitude: 11.7147 },
}

const occurrenceAt = (eventId: string, venueId: string) => ({
    eventId,
    date: "2026-10-24",
    venue: {
        id: venueId,
        coordinates: coordinatesOf[venueId] ?? { latitude: 0, longitude: 0 },
    },
})

const venueAt = (venueId: string) => ({
    id: venueId,
    coordinates: coordinatesOf[venueId] ?? { latitude: 0, longitude: 0 },
})

describe("spotEntriesOf", () => {
    it("lists the occurrences of the venue in result order, then the permanent venue", () => {
        const results = {
            occurrences: [
                occurrenceAt("jazz", "chiostro"),
                occurrenceAt("cinema", "rocca"),
                occurrenceAt("poetry", "chiostro"),
            ],
            permanentVenues: [venueAt("rocca"), venueAt("chiostro")],
        }

        expect(spotEntriesOf(results, "chiostro")).toStrictEqual([
            { type: "occurrence", occurrence: occurrenceAt("jazz", "chiostro") },
            { type: "occurrence", occurrence: occurrenceAt("poetry", "chiostro") },
            { type: "venue", venue: venueAt("chiostro") },
        ])
    })

    it("lists the occurrences of a venue too close to tell apart after those of the venue, in result order", () => {
        const results = {
            occurrences: [
                occurrenceAt("jazz", "chiostro"),
                occurrenceAt("cinema", "rocca"),
                occurrenceAt("market", "loggia"),
            ],
            permanentVenues: [],
        }

        expect(spotEntriesOf(results, "loggia")).toStrictEqual([
            { type: "occurrence", occurrence: occurrenceAt("jazz", "chiostro") },
            { type: "occurrence", occurrence: occurrenceAt("market", "loggia") },
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
