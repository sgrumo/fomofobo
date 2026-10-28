import { categoryIconValues } from "models"
import { describe, expect, it } from "vitest"

import { PIXEL_GLYPH_GRID, PIXEL_GLYPHS } from "./pixel-glyphs"

describe("PIXEL_GLYPHS", () => {
    it.each(categoryIconValues)(
        "draws the %s glyph on a 7×7 grid of filled and empty cells",
        icon => {
            const rows = PIXEL_GLYPHS[icon]

            expect(rows).toHaveLength(PIXEL_GLYPH_GRID)
            expect(rows.every(row => /^[#.]{7}$/u.test(row))).toBe(true)
            expect(rows.some(row => row.includes("#"))).toBe(true)
        },
    )
})
