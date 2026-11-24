import { describe, expect, it } from "vitest"

import { distinctPlacesOf, placeSuggestionOf, rankedPlacesOf } from "./geoapify-provider"

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

describe("rankedPlacesOf", () => {
    const town = (name: string, lat: number) => ({
        address_line1: name,
        city: name,
        county: "Bologna",
        county_code: "BO",
        state: "Emilia-Romagna",
        lat,
        lon: 11.71,
        result_type: "city",
    })
    const quarter = (name: string, lat: number) => ({
        address_line1: name,
        city: "Milano",
        county: "Milano",
        county_code: "MI",
        state: "Lombardia",
        lat,
        lon: 9.19,
        result_type: "suburb",
    })

    it("puts the town of the typed name before the near places of a close name", () => {
        expect(
            rankedPlacesOf(
                "imola",
                [town("Imola", 44.35), town("Isola", 44.1)],
                [quarter("Isola", 45.49), quarter("Via Imola", 45.47)],
            ).map(place => place.label),
        ).toStrictEqual([
            "Imola, Bologna, Emilia-Romagna",
            "Isola, Milano (MI), Lombardia",
            "Via Imola, Milano (MI), Lombardia",
        ])
    })

    it("matches the name with no case, accents or extra spaces, and a town whose name opens with the text after it", () => {
        expect(
            rankedPlacesOf(
                "  san lazzaro ",
                [town("San Lazzaro di Savena", 44.47), town("San Làzzaro", 44.2)],
                [quarter("San Lazzaro", 45.48)],
            ).map(place => place.address),
        ).toStrictEqual([
            "San Làzzaro, Bologna",
            "San Lazzaro di Savena, Bologna",
            "San Lazzaro, Milano (MI)",
        ])
    })

    it("keeps the order of the near places when no town has the typed name", () => {
        expect(
            rankedPlacesOf(
                "bolognina",
                [town("Bologna", 44.49)],
                [quarter("Bolognina", 45.5), town("Bolognina", 44.7)],
            ).map(place => place.coordinates.latitude),
        ).toStrictEqual([44.7, 45.5])
    })

    it("keeps five suggestions at most", () => {
        expect(
            rankedPlacesOf(
                "via roma",
                [],
                [45.1, 45.2, 45.3, 45.4, 45.5, 45.6].map(lat =>
                    quarter(`Via Roma ${String(lat)}`, lat),
                ),
            ),
        ).toHaveLength(5)
    })
})
