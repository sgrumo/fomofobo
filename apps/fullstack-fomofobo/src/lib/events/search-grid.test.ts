import { describe, expect, it } from "vitest"

import { snapToSearchGrid } from "./search-grid"

describe("snapToSearchGrid", () => {
    it("grows a box outward to the lines of a grid of its size", () => {
        expect(
            snapToSearchGrid({ west: 11.27, south: 44.46, east: 11.41, north: 44.53 }),
        ).toStrictEqual({ west: 11.25, south: 44.45, east: 11.45, north: 44.55 })
    })

    it("gives close boxes of one size the same edges", () => {
        expect(
            snapToSearchGrid({
                west: 11.261,
                south: 44.452,
                east: 11.402,
                north: 44.521,
            }),
        ).toStrictEqual(
            snapToSearchGrid({
                west: 11.268,
                south: 44.457,
                east: 11.409,
                north: 44.528,
            }),
        )
    })

    it("keeps an edge that lies on a line of the grid", () => {
        expect(
            snapToSearchGrid({ west: 11.25, south: 44.45, east: 11.43, north: 44.54 }),
        ).toStrictEqual({ west: 11.25, south: 44.45, east: 11.45, north: 44.55 })
    })

    it("takes the largest step for a box wider than every step of the grid", () => {
        expect(
            snapToSearchGrid({ west: 6.3, south: 35.2, east: 18.9, north: 47.4 }),
        ).toStrictEqual({ west: 5, south: 35, east: 20, north: 50 })
    })
})
