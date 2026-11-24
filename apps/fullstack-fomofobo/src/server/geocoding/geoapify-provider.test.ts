import { describe, expect, it } from "vitest"

import { distinctPlacesOf, placeSuggestionOf } from "./geoapify-provider"

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

describe("distinctPlacesOf", () => {
    const capital = {
        address_line1: "Bologna",
        city: "Bologna",
        county: "Bologna",
        county_code: "BO",
        state: "Emilia-Romagna",
    }

    it("keeps the town over the province of the same name, in the place of the first", () => {
        expect(
            distinctPlacesOf([
                { ...capital, lat: 44.4333, lon: 11.3945, result_type: "county" },
                { ...capital, lat: 44.4938, lon: 11.3426, result_type: "city" },
                { ...capital, lat: 44.4938, lon: 11.3426, result_type: "city" },
                {
                    address_line1: "Bologna",
                    city: "Nave",
                    county: "Brescia",
                    county_code: "BS",
                    state: "Lombardia",
                    lat: 45.5847,
                    lon: 10.2962,
                    result_type: "suburb",
                },
            ]),
        ).toStrictEqual([
            {
                label: "Bologna, Emilia-Romagna",
                address: "Bologna",
                coordinates: { latitude: 44.4938, longitude: 11.3426 },
            },
            {
                label: "Bologna, Nave (BS), Lombardia",
                address: "Bologna, Nave (BS)",
                coordinates: { latitude: 45.5847, longitude: 10.2962 },
            },
        ])
    })

    it("keeps an area that no place shares its label with", () => {
        expect(
            distinctPlacesOf([
                {
                    address_line1: "Toscana",
                    state: "Toscana",
                    ...coordinates,
                    result_type: "state",
                },
            ]),
        ).toStrictEqual([
            {
                label: "Toscana",
                address: "Toscana",
                coordinates: { latitude: 44.35, longitude: 11.71 },
            },
        ])
    })
})
