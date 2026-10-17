import { describe, expect, it } from "vitest"

import { haversineDistance } from "./haversine-distance"

describe("haversineDistance", () => {
    it("measures one degree of latitude as 1/360 of the circumference", () => {
        expect(
            haversineDistance(
                { latitude: 0, longitude: 0 },
                { latitude: 1, longitude: 0 },
            ),
        ).toBeCloseTo((2 * Math.PI * 6_371_000) / 360, 3)
    })

    it("measures a quarter of the equator", () => {
        expect(
            haversineDistance(
                { latitude: 0, longitude: 0 },
                { latitude: 0, longitude: 90 },
            ),
        ).toBeCloseTo((Math.PI / 2) * 6_371_000, 3)
    })

    it("measures zero between a point and itself", () => {
        const point = { latitude: 44.3533, longitude: 11.7147 }

        expect(haversineDistance(point, point)).toBe(0)
    })
})
