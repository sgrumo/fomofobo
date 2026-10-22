import { describe, expect, it } from "vitest"

import { createI18nInstance } from "@/lib/i18n/instance"

import shared from "../../../../public/locales/it/shared.json"
import ui from "../../../../public/locales/it/ui.json"
import {
    initialVenueFormState,
    venueFormReducer,
    venueFormStateToCreation,
    venueFormStateToUpdate,
} from "./venue-form.state"

const i18n = createI18nInstance("it", { shared, ui })

describe("venueFormReducer", () => {
    it("fills the address and the coordinates from a picked place", () => {
        const state = venueFormReducer(initialVenueFormState(), {
            type: "place",
            value: {
                label: "Via Emilia 1, Imola, Italy",
                coordinates: { latitude: 44.3533, longitude: 11.7147 },
            },
        })

        expect(state).toStrictEqual({
            ...initialVenueFormState(),
            address: "Via Emilia 1, Imola, Italy",
            latitude: "44.3533",
            longitude: "11.7147",
        })
    })

    it("keeps six decimals of a pin moved on the map", () => {
        const state = venueFormReducer(initialVenueFormState(), {
            type: "pin",
            value: { latitude: 44.353312345, longitude: 11.714798765 },
        })

        expect(state).toMatchObject({ latitude: "44.353312", longitude: "11.714799" })
    })
})

describe("venueFormStateToCreation", () => {
    it("maps the fields to a venue", () => {
        expect(
            venueFormStateToCreation(
                {
                    ...initialVenueFormState(),
                    name: "Chiostro",
                    address: "Via Emilia 1, Imola",
                    latitude: "44.3533",
                    longitude: "11.7147",
                },
                i18n,
            ),
        ).toStrictEqual({
            success: true,
            value: {
                name: "Chiostro",
                address: "Via Emilia 1, Imola",
                coordinates: { latitude: 44.3533, longitude: 11.7147 },
            },
        })
    })

    it("puts the coordinate errors on the coordinate fields", () => {
        const result = venueFormStateToCreation(
            {
                ...initialVenueFormState(),
                name: "Chiostro",
                address: "Via Emilia 1, Imola",
                latitude: "120",
                longitude: undefined,
            },
            i18n,
        )

        expect(result).toMatchObject({
            success: false,
            error: {
                latitude: { errors: [expect.any(String)] },
                longitude: { errors: [expect.any(String)] },
            },
        })
    })
})

describe("venueFormStateToUpdate", () => {
    it("maps the profile fields, an emptied link to null", () => {
        expect(
            venueFormStateToUpdate(
                {
                    name: "Chiostro",
                    address: "Via Emilia 1, Imola",
                    latitude: "44.3533",
                    longitude: "11.7147",
                    description: "Concerts in the cloister.",
                    websiteUrl: "https://www.chiostro.it",
                    instagramUrl: undefined,
                    facebookUrl: undefined,
                },
                i18n,
            ),
        ).toStrictEqual({
            success: true,
            value: {
                name: "Chiostro",
                address: "Via Emilia 1, Imola",
                coordinates: { latitude: 44.3533, longitude: 11.7147 },
                coverPhotoKey: undefined,
                description: "Concerts in the cloister.",
                links: {
                    websiteUrl: "https://www.chiostro.it",
                    instagramUrl: null,
                    facebookUrl: null,
                },
            },
        })
    })

    it("puts a link error on its field", () => {
        const result = venueFormStateToUpdate(
            {
                ...initialVenueFormState(),
                name: "Chiostro",
                address: "Via Emilia 1, Imola",
                latitude: "44.3533",
                longitude: "11.7147",
                instagramUrl: "https://example.com/chiostro",
            },
            i18n,
        )

        expect(result).toMatchObject({
            success: false,
            error: { instagramUrl: { errors: [expect.any(String)] } },
        })
    })
})
