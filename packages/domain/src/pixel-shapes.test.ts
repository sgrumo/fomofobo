import { describe, expect, it } from "vitest"

import {
    PIXEL_CELL,
    PIXEL_CIRCLE_SIZES,
    PIXEL_CORNER_PROFILE,
    pixelCircleProfile,
} from "./pixel-shapes"

describe("pixelCircleProfile", () => {
    it("steps a 36 px circle on whole cells", () => {
        expect(pixelCircleProfile(36)).toStrictEqual([
            12, 12, 8, 8, 6, 6, 4, 4, 2, 2, 2, 2,
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
        expect(PIXEL_CORNER_PROFILE).toStrictEqual([4, 4, 2, 2])
    })
})
