import { describe, expect, it } from "vitest"

import { FALLBACK_GRID, fallbackGrid, ICON_SCALE } from "./fallback-grid"

const SQUARE = [
    "............",
    "....##......",
    "....##......",
    "............",
    "............",
    "............",
    "............",
    "............",
    "............",
    "............",
    "............",
    "............",
]

/**
 * @description Returns the cell of the grid at a point
 * @param cells Cells of the grid
 * @param x Column of the cell
 * @param y Row of the cell
 */
const cellAt = (cells: Uint8Array, x: number, y: number) =>
    cells[y * FALLBACK_GRID.width + x]

describe("fallbackGrid", () => {
    it("draws the filled pixels of the icon dark and centered on the grid", () => {
        const cells = fallbackGrid(SQUARE)
        const side = 2 * ICON_SCALE
        const left = Math.floor((FALLBACK_GRID.width - side) / 2)
        const top = Math.floor((FALLBACK_GRID.height - side) / 2)

        expect([
            cells.length,
            cellAt(cells, left, top),
            cellAt(cells, left + side - 1, top + side - 1),
            cellAt(cells, left - 1, top),
            cellAt(cells, left + side, top),
        ]).toStrictEqual([FALLBACK_GRID.width * FALLBACK_GRID.height, 0, 0, 1, 1])
    })

    it("dots one cell in four of every fourth row, and none near the icon", () => {
        const cells = fallbackGrid(SQUARE)
        const dark = cells.filter(cell => cell === 0).length
        const iconCells = 4 * ICON_SCALE * ICON_SCALE
        const left = Math.floor((FALLBACK_GRID.width - 2 * ICON_SCALE) / 2)
        const top = Math.floor((FALLBACK_GRID.height - 2 * ICON_SCALE) / 2)

        expect([
            cellAt(cells, 0, 0),
            cellAt(cells, 1, 0),
            cellAt(cells, 2, 4),
            // A cell of the dot lattice, two cells above the icon
            cellAt(cells, left, top - 2),
        ]).toStrictEqual([0, 1, 0, 1])
        expect(dark - iconCells).toBeLessThanOrEqual(
            Math.ceil(FALLBACK_GRID.height / 4) * (FALLBACK_GRID.width / 4),
        )
    })
})
