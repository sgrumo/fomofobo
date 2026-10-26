import { describe, expect, it } from "vitest"

import {
    cellsPath,
    dottedRing,
    LIVE_WAVE_RINGS,
    PIXEL_CELL,
    PIXEL_CIRCLE_SIZES,
    PIXEL_CORNER_PROFILE,
    pixelCircleProfile,
} from "./pixel-shapes"
import type { CellCorner } from "./pixel-shapes"

describe("pixelCircleProfile", () => {
    it("steps a 36 px circle on whole cells", () => {
        expect(pixelCircleProfile(36)).toStrictEqual([
            12, 12, 12, 6, 6, 6, 3, 3, 3, 3, 3, 3,
        ])
    })

    it.each(PIXEL_CIRCLE_SIZES)("keeps the circle %i inside its upper half", size => {
        const profile = pixelCircleProfile(size)

        expect(profile.length).toBeLessThanOrEqual(size / 2)
        expect(Math.min(...profile)).toBeGreaterThan(0)
        expect(Math.max(...profile)).toBeLessThan(size / 2)
    })

    it.each(PIXEL_CIRCLE_SIZES)(
        "narrows the circle %i inward by whole cells, row by row",
        size => {
            const profile = pixelCircleProfile(size)

            expect(profile.every(inset => inset % PIXEL_CELL === 0)).toBe(true)
            expect(profile.length % PIXEL_CELL).toBe(0)
            expect(profile).toStrictEqual(
                profile.toSorted((first, second) => second - first),
            )
        },
    )
})

describe("PIXEL_CORNER_PROFILE", () => {
    it("steps two cells in, then one", () => {
        expect(PIXEL_CORNER_PROFILE).toStrictEqual([6, 6, 6, 3, 3, 3])
    })
})

describe("dottedRing", () => {
    it.each(LIVE_WAVE_RINGS.map(ring => ring.radius))(
        "mirrors the ring %i across both axes",
        radius => {
            const keys = (corners: readonly CellCorner[]) =>
                corners.map(([x, y]) => `${String(x)} ${String(y)}`).toSorted()
            const ring = dottedRing(radius)

            expect(keys(ring.map(([x, y]) => [-x - PIXEL_CELL, y]))).toStrictEqual(
                keys(ring),
            )
            expect(keys(ring.map(([x, y]) => [x, -y - PIXEL_CELL]))).toStrictEqual(
                keys(ring),
            )
        },
    )

    it.each(LIVE_WAVE_RINGS.map(ring => ring.radius))(
        "keeps each cell of the ring %i on the grid, near the circle",
        radius => {
            const ring = dottedRing(radius)

            expect(ring.flat().every(offset => offset % PIXEL_CELL === 0)).toBe(true)
            expect(
                Math.max(
                    ...ring.map(([x, y]) =>
                        Math.abs(
                            Math.hypot(x + PIXEL_CELL / 2, y + PIXEL_CELL / 2) - radius,
                        ),
                    ),
                ),
            ).toBeLessThan(PIXEL_CELL)
        },
    )

    it("spaces the dots a cell and a gap apart", () => {
        expect(dottedRing(31)).toHaveLength(32)
    })
})

describe("cellsPath", () => {
    it("draws one closed cell per corner", () => {
        expect(
            cellsPath([
                [0, -3],
                [6, 9],
            ]),
        ).toBe("M0 -3h3v3h-3zM6 9h3v3h-3z")
    })
})

describe("LIVE_WAVE_RINGS", () => {
    it("lights the rings in turn, inner first, within one period", () => {
        expect(LIVE_WAVE_RINGS.map(ring => ring.delayMs)).toStrictEqual([
            -1000, -750, -500, -250,
        ])
    })
})
