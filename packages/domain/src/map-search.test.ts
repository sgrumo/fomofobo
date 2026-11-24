import { describe, expect, it } from "vitest"

import {
    isEmptySuggestions,
    placeQueryOf,
    submittedSuggestionOf,
    textQueryOf,
    venueSuggestionGroupsOf,
} from "./map-search"

const venue = (name: string, kind: "regular" | "cinema" | "museum") => ({
    venueId: crypto.randomUUID(),
    name,
    address: "Via Emilia 1, Imola",
    kind,
})

describe("placeQueryOf", () => {
    it("centers on the rounded place, names it and clears the text", () => {
        expect(
            placeQueryOf({
                label: "Imola, Bologna, Emilia-Romagna",
                address: "Imola, Bologna",
                coordinates: { latitude: 44.3532, longitude: 11.7148 },
            }),
        ).toStrictEqual({
            lat: 44.353,
            lng: 11.715,
            place: "Imola, Bologna, Emilia-Romagna",
            q: undefined,
        })
    })
})

describe("textQueryOf", () => {
    it("sets the trimmed text and clears the place", () => {
        expect(textQueryOf("  jazz ")).toStrictEqual({ q: "jazz", place: undefined })
    })

    it("clears the text and the place on a blank text", () => {
        expect(textQueryOf("  ")).toStrictEqual({ q: undefined, place: undefined })
    })
})

describe("submittedSuggestionOf", () => {
    const imola = {
        label: "Imola, Bologna, Emilia-Romagna",
        address: "Imola, Bologna",
        coordinates: { latitude: 44.3532, longitude: 11.7148 },
    }
    const bologna = {
        label: "Bologna, Emilia-Romagna",
        address: "Bologna",
        coordinates: { latitude: 44.4949, longitude: 11.3426 },
    }
    const jazzNight = {
        eventId: crypto.randomUUID(),
        date: "2026-11-28",
        title: "Imola Jazz Night",
    }

    it("picks the first place, the first row of the list, even when an event or a venue matches", () => {
        expect(
            submittedSuggestionOf({
                places: [imola, bologna],
                events: [jazzNight],
                venues: [venue("Imola Jazz Club", "regular")],
            }),
        ).toStrictEqual({ type: "place", place: imola })
    })

    it("picks the first event when no place matches", () => {
        expect(
            submittedSuggestionOf({
                places: [],
                events: [jazzNight],
                venues: [venue("Imola Jazz Club", "regular")],
            }),
        ).toStrictEqual({ type: "event", event: jazzNight })
    })

    it("picks the first regular venue before a permanent venue, in the order of the groups", () => {
        const rocca = venue("Rocca di Imola", "museum")
        const club = venue("Imola Jazz Club", "regular")

        expect(
            submittedSuggestionOf({
                places: [],
                events: [],
                venues: [rocca, club],
            }),
        ).toStrictEqual({ type: "venue", venue: club })
    })

    it("keeps a text search with no suggestion", () => {
        expect(
            submittedSuggestionOf({
                places: [],
                events: [],
                venues: [],
            }),
        ).toBeUndefined()
    })
})

describe("venueSuggestionGroupsOf", () => {
    it("splits regular venues from permanent venues, in response order", () => {
        const chiostro = venue("Chiostro", "regular")
        const centrale = venue("Cinema Centrale", "cinema")
        const osservanza = venue("Osservanza", "regular")
        const rocca = venue("Rocca", "museum")

        expect(
            venueSuggestionGroupsOf([chiostro, centrale, osservanza, rocca]),
        ).toStrictEqual({ regular: [chiostro, osservanza], permanent: [centrale, rocca] })
    })
})

describe("isEmptySuggestions", () => {
    it("is true with no place, event or venue", () => {
        expect(isEmptySuggestions({ places: [], events: [], venues: [] })).toBe(true)
    })

    it("is false with one venue", () => {
        expect(
            isEmptySuggestions({
                places: [],
                events: [],
                venues: [venue("Chiostro", "regular")],
            }),
        ).toBe(false)
    })
})
