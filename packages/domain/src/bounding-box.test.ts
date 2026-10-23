import { describe, expect, it } from "vitest"

import { boundingBox } from "./bounding-box"
import { haversineDistance } from "./haversine-distance"

describe("boundingBox", () => {
    it("touches the circle on each side", () => {
        const center = { latitude: 44.3533, longitude: 11.7147 }
        const box = boundingBox(center, 5000)

        expect([
            haversineDistance(center, {
                latitude: box.maxLatitude,
                longitude: center.longitude,
            }),
            haversineDistance(center, {
                latitude: box.minLatitude,
                longitude: center.longitude,
            }),
            haversineDistance(center, {
                latitude: center.latitude,
                longitude: box.maxLongitude,
            }),
            haversineDistance(center, {
                latitude: center.latitude,
                longitude: box.minLongitude,
            }),
        ]).toStrictEqual([
            expect.closeTo(5000, 0),
            expect.closeTo(5000, 0),
            expect.closeTo(5000, -2),
            expect.closeTo(5000, -2),
        ])
    })

    it("covers every longitude at a pole", () => {
        const box = boundingBox({ latitude: 90, longitude: 0 }, 5000)

        expect([box.minLongitude, box.maxLongitude, box.maxLatitude]).toStrictEqual([
            -180, 180, 90,
        ])
    })
})
