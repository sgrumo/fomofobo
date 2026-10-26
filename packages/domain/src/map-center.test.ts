import { describe, expect, it } from "vitest"

import {
    centerQueryOf,
    LOCATE_ZOOM,
    mapFlightOf,
    nextLocateRequest,
    searchCenterOf,
} from "./map-center"
import { DEFAULT_CITY } from "./platform"

describe("searchCenterOf", () => {
    it("searches around the query center while the location is unknown", () => {
        expect(searchCenterOf({ lat: 44.36, lng: 11.69 }, "unknown")).toStrictEqual({
            center: { latitude: 44.36, longitude: 11.69 },
            hasQueryCenter: true,
            locationOff: false,
            searchReady: true,
        })
    })

    it("holds the search on the default city until the device answers", () => {
        expect(searchCenterOf({}, "unknown")).toStrictEqual({
            center: DEFAULT_CITY.center,
            hasQueryCenter: false,
            locationOff: false,
            searchReady: false,
        })
    })

    it("holds the search on a granted location until its fix becomes the query center", () => {
        expect(searchCenterOf({}, "granted").searchReady).toBe(false)
    })

    it("searches the default city when the location is denied", () => {
        expect(searchCenterOf({}, "denied")).toStrictEqual({
            center: DEFAULT_CITY.center,
            hasQueryCenter: false,
            locationOff: true,
            searchReady: true,
        })
    })

    it("searches the default city when the location is unavailable", () => {
        expect(searchCenterOf({}, "unavailable")).toMatchObject({
            center: DEFAULT_CITY.center,
            searchReady: true,
        })
    })

    it("ignores a query with one coordinate alone", () => {
        expect(searchCenterOf({ lat: 44.36 }, "denied").center).toStrictEqual(
            DEFAULT_CITY.center,
        )
    })
})

describe("centerQueryOf", () => {
    it("snaps the point to the search grid", () => {
        expect(centerQueryOf({ latitude: 44.35349, longitude: 11.71449 })).toStrictEqual({
            lat: 44.353,
            lng: 11.714,
        })
    })
})

describe("mapFlightOf", () => {
    const position = { latitude: 44.35281, longitude: 11.71204 }
    const rounded = { latitude: 44.353, longitude: 11.712 }

    it("flies to the exact position at the locate zoom when the locate set the center", () => {
        expect(
            mapFlightOf(rounded, nextLocateRequest(position, undefined)),
        ).toStrictEqual({
            center: position,
            zoom: LOCATE_ZOOM,
        })
    })

    it("flies to the center at the current zoom when another center replaced the locate", () => {
        const elsewhere = { latitude: 44.36, longitude: 11.69 }

        expect(
            mapFlightOf(elsewhere, nextLocateRequest(position, undefined)),
        ).toStrictEqual({
            center: elsewhere,
            zoom: undefined,
        })
    })

    it("flies to the center at the current zoom before any locate", () => {
        expect(mapFlightOf(rounded, undefined)).toStrictEqual({
            center: rounded,
            zoom: undefined,
        })
    })
})

describe("nextLocateRequest", () => {
    it("counts each locate, so a locate at the same position still moves the map", () => {
        const first = nextLocateRequest({ latitude: 44.35, longitude: 11.71 }, undefined)

        expect(nextLocateRequest(first.position, first).count).toBe(2)
    })
})
