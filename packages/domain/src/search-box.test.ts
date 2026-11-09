import { describe, expect, it } from "vitest"

import { nextSearchArea, searchBoxOf } from "./search-box"

const imola = { latitude: 44.353, longitude: 11.715 }
const bologna = { latitude: 44.494, longitude: 11.343 }

describe("searchBoxOf", () => {
    it("covers the search radius around a new center, snapped outward to the grid", () => {
        expect(searchBoxOf(undefined, imola)).toStrictEqual({
            west: 11.65,
            south: 44.3,
            east: 11.78,
            north: 44.4,
        })
    })

    it("keeps the box of the area while the center stays", () => {
        const box = { west: 11, south: 44, east: 12, north: 45 }

        expect(searchBoxOf({ center: imola, box }, imola)).toBe(box)
    })

    it("drops the box of the area once the center moves", () => {
        const box = { west: 11, south: 44, east: 12, north: 45 }

        expect(searchBoxOf({ center: imola, box }, bologna)).toStrictEqual(
            searchBoxOf(undefined, bologna),
        )
    })
})

describe("nextSearchArea", () => {
    const area = { center: imola, box: { west: 11, south: 44, east: 12, north: 45 } }

    it("keeps the box when it holds the viewport and its answer was whole", () => {
        expect(
            nextSearchArea([11.2, 44.2, 11.8, 44.8], imola, area, false),
        ).toStrictEqual(area)
    })

    it("searches the viewport and a margin of a quarter on each side once the viewport leaves the box", () => {
        expect(
            nextSearchArea([11.51, 44.51, 12.49, 45.29], imola, area, false),
        ).toStrictEqual({
            center: imola,
            box: { west: 11.26, south: 44.31, east: 12.74, north: 45.49 },
        })
    })

    it("searches the viewport again when the answer of the box left results out", () => {
        expect(
            nextSearchArea([11.21, 44.21, 11.79, 44.79], imola, area, true),
        ).toStrictEqual({
            center: imola,
            box: { west: 11.06, south: 44.06, east: 11.94, north: 44.94 },
        })
    })

    it("cuts the box to the edges of the map", () => {
        expect(nextSearchArea([2, 33, 22, 50], imola, area, false)).toStrictEqual({
            center: imola,
            box: { west: 6, south: 35, east: 19, north: 47.5 },
        })
    })

    it("searches from the radius of a new center, not from the box of the old one", () => {
        expect(
            nextSearchArea([11.3, 44.45, 11.38, 44.53], bologna, area, false),
        ).toStrictEqual({ center: bologna, box: searchBoxOf(undefined, bologna) })
    })
})
