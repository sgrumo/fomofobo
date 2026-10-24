import { directionsUrl } from "domain/directions-url"
import { describe, expect, it } from "vitest"

import { mapsProviderOf } from "./maps-provider"

const venue = { latitude: 44.3546, longitude: 11.7139 }

describe("mapsProviderOf", () => {
    it("opens Apple Maps on iOS", () => {
        expect(directionsUrl(venue, mapsProviderOf("ios"))).toBe(
            "https://maps.apple.com/directions?destination=44.3546,11.7139",
        )
    })

    it("opens Google Maps on Android", () => {
        expect(directionsUrl(venue, mapsProviderOf("android"))).toBe(
            "https://www.google.com/maps/dir/?api=1&destination=44.3546,11.7139",
        )
    })
})
