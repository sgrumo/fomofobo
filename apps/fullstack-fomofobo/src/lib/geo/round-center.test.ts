import { describe, expect, it } from "vitest"

import { haversineDistance } from "./haversine-distance"
import { roundCenter } from "./round-center"

describe("roundCenter", () => {
    it("snaps two positions a few meters apart to the same center", () => {
        const first = roundCenter({ latitude: 44.35331, longitude: 11.71468 })
        const second = roundCenter({ latitude: 44.35349, longitude: 11.71452 })

        expect(first).toStrictEqual(second)
    })

    it("moves the center by less than 100 m", () => {
        const position = { latitude: 44.35349, longitude: 11.71449 }

        expect(haversineDistance(position, roundCenter(position))).toBeLessThan(100)
    })
})
