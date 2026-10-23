import { describe, expect, it } from "vitest"

import {
    isEmptySuggestions,
    placeQueryOf,
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
                label: "Imola, BO",
                coordinates: { latitude: 44.3532, longitude: 11.7148 },
            }),
        ).toStrictEqual({ lat: 44.353, lng: 11.715, place: "Imola, BO", q: undefined })
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
