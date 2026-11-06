// Map markers of the public clients, as the `gen.py` raster of the fomo-locator reference: cells
// on a square grid around a center, a cell in when the distance from its middle to the center
// passes a test. Paths run in cell units, and each client scales one cell to `MARKER_CELL_PX`.

import { LIVE_WAVE_RUNS, POSITION_WAVE_RUNS } from "./pixel-waves"

export const MARKER_CELL_PX = 2

type CellTest = (distance: number, x: number, y: number) => boolean

export interface MarkerSprite {
    cells: number
    frames: number
    cycleMs: number
    // Cells every frame shares, drawn still under the strip
    stillPath: string
    path: string
}

/**
 * @description Returns the cells from the center to the edge of the grid that holds a circle
 * @param reach Radius of the circle, in cells
 */
const padOf = (reach: number): number => Math.ceil(reach) + 1

/**
 * @description Builds the SVG path data of the cells that pass a test, one rectangle per horizontal run
 * @param reach Radius of the circle the grid holds, in cells
 * @param test Test of a cell, from the distance of its middle and its offset from the center
 * @param shiftX Cells the path moves right
 * @param shiftY Cells the path moves down
 */
const cellsPathOf = (reach: number, test: CellTest, shiftX = 0, shiftY = 0): string => {
    const pad = padOf(reach)
    const offsets = Array.from({ length: 2 * pad }, (_, index) => index - pad)
    return offsets
        .flatMap(y => {
            const row = offsets
                .map(x => (test(Math.hypot(x + 0.5, y + 0.5), x, y) ? "#" : "."))
                .join("")
            return [...row.matchAll(/#+/gu)].map(
                run =>
                    `M${String(run.index + shiftX)} ${String(y + pad + shiftY)}h${String(run[0].length)}v1h-${String(run[0].length)}z`,
            )
        })
        .join("")
}

/**
 * @description Builds an event disc: a fill, a ring one cell wide, and the solid shadow of a selected disc
 * @param radius Radius of the disc, in cells
 */
const discOf = (radius: number) => {
    const reach = radius + 1
    return {
        cells: 2 * padOf(reach),
        fillPath: cellsPathOf(reach, distance => distance <= radius - 1),
        ringPath: cellsPathOf(
            reach,
            distance => distance > radius - 1 && distance <= radius,
        ),
        // Two cells right and down, under the disc
        shadowPath: cellsPathOf(reach, distance => distance <= radius, 2, 2),
    }
}

export const EVENT_DISC = discOf(9)

export const SELECTED_EVENT_DISC = discOf(11)

/**
 * @description Builds the SVG path data of runs of cells, one rectangle per run
 * @param runs Runs as `x y length`, comma-separated
 * @param shiftX Cells the path moves right
 */
const runsPathOf = (runs: string, shiftX = 0): string =>
    runs === ""
        ? ""
        : runs
              .split(",")
              .map(run => {
                  const [x = 0, y = 0, length = 0] = run.split(" ").map(Number)
                  return `M${String(x + shiftX)} ${String(y)}h${String(length)}v1h-${String(length)}z`
              })
              .join("")

/**
 * @description Builds a sprite from the runs of its frames, one frame beside the other
 * @param runs Side, cycle, shared cells and frames of the sprite
 */
const spriteOf = (runs: {
    cells: number
    cycleMs: number
    still: string
    frames: readonly string[]
}): MarkerSprite => ({
    cells: runs.cells,
    frames: runs.frames.length,
    cycleMs: runs.cycleMs,
    stillPath: runsPathOf(runs.still),
    path: runs.frames
        .map((frame, index) => runsPathOf(frame, index * runs.cells))
        .join(""),
})

export const LIVE_WAVE = spriteOf(LIVE_WAVE_RUNS)

const POSITION_REACH = 5.5

export const POSITION_CORE = {
    cells: 2 * padOf(POSITION_REACH),
    fillPath: cellsPathOf(POSITION_REACH, distance => distance <= 4),
    ringPath: cellsPathOf(
        POSITION_REACH,
        distance => distance > 4 && distance <= POSITION_REACH,
    ),
}

export const POSITION_WAVE = spriteOf(POSITION_WAVE_RUNS)

const CLUSTER_REACH = 14

export const CLUSTER_SHAPE = {
    cells: 2 * padOf(CLUSTER_REACH),
    fillPath: cellsPathOf(CLUSTER_REACH, distance => distance <= 10),
    inkPath: cellsPathOf(
        CLUSTER_REACH,
        distance =>
            (distance > 10 && distance <= 11) || (distance > 13 && distance <= 14),
    ),
    // The band between the two rings that the progress ring fills
    bandPath: cellsPathOf(CLUSTER_REACH, distance => distance > 11.5 && distance <= 13),
}
