import { describe, expect, it } from "vitest"

import { occurrenceShareTextOf, shareSummaryOf, venueShareTextOf } from "./share-summary"

describe("shareSummaryOf", () => {
    it("reads the date and the time in the platform zone", () => {
        // 22:30 UTC on Wednesday the 14th is 00:30 on Thursday the 15th in Rome.
        const occurrence = {
            startsAt: "2026-10-14T22:30:00.000Z",
            venue: {
                id: crypto.randomUUID(),
                name: "Chiostro di San Francesco",
                coordinates: { latitude: 44.3533, longitude: 11.7147 },
                isBlocked: false,
            },
        }

        expect(shareSummaryOf(occurrence, "it")).toBe(
            "gio 15/10 · 00:30 · Chiostro di San Francesco",
        )
    })
})

describe("occurrenceShareTextOf", () => {
    it("puts the title before the summary", () => {
        const occurrence = {
            title: "Jazz al Chiostro",
            startsAt: "2026-10-24T19:00:00.000Z",
            venue: {
                id: crypto.randomUUID(),
                name: "Chiostro di San Domenico",
                coordinates: { latitude: 44.3546, longitude: 11.7139 },
                isBlocked: false,
            },
        }

        expect(occurrenceShareTextOf(occurrence, "it")).toBe(
            "Jazz al Chiostro · sab 24/10 · 21:00 · Chiostro di San Domenico",
        )
    })
})

describe("venueShareTextOf", () => {
    it("reads the name and the address of the venue", () => {
        expect(
            venueShareTextOf({
                name: "Chiostro di San Francesco",
                address: "Via Emilia 1, Imola",
            }),
        ).toBe("Chiostro di San Francesco · Via Emilia 1, Imola")
    })
})
