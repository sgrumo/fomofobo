import { describe, expect, it } from "vitest"

import { placeSuggestionOf } from "./geoapify-provider"

const coordinates = { lat: 44.35, lon: 11.71 }

describe("placeSuggestionOf", () => {
    it("names a hamlet with its municipality, its province code and its region in full", () => {
        expect(
            placeSuggestionOf({
                address_line1: "Corsalone",
                postcode: "52011",
                city: "Chiusi della Verna",
                county: "Arezzo",
                county_code: "AR",
                state: "Toscana",
                ...coordinates,
            }),
        ).toStrictEqual({
            label: "Corsalone, Chiusi della Verna (AR), Toscana",
            address: "Corsalone, Chiusi della Verna (AR)",
            coordinates: { latitude: 44.35, longitude: 11.71 },
        })
    })

    it("puts the postcode before the municipality of a street address", () => {
        expect(
            placeSuggestionOf({
                address_line1: "Via Emilia, 10",
                housenumber: "10",
                postcode: "40026",
                city: "Imola",
                county: "Bologna",
                county_code: "BO",
                state: "Emilia-Romagna",
                ...coordinates,
            }),
        ).toMatchObject({
            label: "Via Emilia, 10, 40026 Imola (BO), Emilia-Romagna",
            address: "Via Emilia, 10, 40026 Imola (BO)",
        })
    })

    it("names a municipality with its province in full", () => {
        expect(
            placeSuggestionOf({
                address_line1: "Imola",
                postcode: "40026",
                city: "Imola",
                county: "Bologna",
                county_code: "BO",
                state: "Emilia-Romagna",
                ...coordinates,
            }),
        ).toMatchObject({
            label: "Imola, Bologna, Emilia-Romagna",
            address: "Imola, Bologna",
        })
    })

    it("names a provincial capital once", () => {
        expect(
            placeSuggestionOf({
                address_line1: "Bologna",
                city: "Bologna",
                county: "Bologna",
                county_code: "BO",
                state: "Emilia-Romagna",
                ...coordinates,
            }),
        ).toMatchObject({ label: "Bologna, Emilia-Romagna", address: "Bologna" })
    })

    it("leaves out the parts the provider does not send", () => {
        expect(
            placeSuggestionOf({
                address_line1: "Toscana",
                state: "Toscana",
                ...coordinates,
            }),
        ).toMatchObject({ label: "Toscana", address: "Toscana" })
    })
})
