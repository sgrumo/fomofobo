import { describe, expect, it } from "vitest"

import { directionsUrl } from "./directions-url"

describe("directionsUrl", () => {
    const venue = { latitude: 44.3533, longitude: 11.7147 }

    it("builds the Apple Maps unified URL", () => {
        expect(directionsUrl(venue, "apple")).toBe(
            "https://maps.apple.com/directions?destination=44.3533,11.7147",
        )
    })

    it("builds the Google Maps URL", () => {
        expect(directionsUrl(venue, "google")).toBe(
            "https://www.google.com/maps/dir/?api=1&destination=44.3533,11.7147",
        )
    })
})
