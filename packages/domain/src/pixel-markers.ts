// Map markers of the public clients, as the `gen.py` raster of the fomo-locator reference: cells
// on a square grid around a center, a cell in when the distance from its middle to the center
// passes a test. Paths run in cell units, and each client scales one cell to `MARKER_CELL_PX`.

import type { CategoryIcon } from "models"

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

// A disc of radius 9 in a grid of 22 cells, with one free cell around its ring
const EVENT_DISC_REACH = 10

export const EVENT_DISC = {
    cells: 2 * padOf(EVENT_DISC_REACH),
    fillPath: cellsPathOf(EVENT_DISC_REACH, distance => distance <= 8),
    ringPath: cellsPathOf(EVENT_DISC_REACH, distance => distance > 8 && distance <= 9),
    shadowPath: "",
}

// The selected disc of the zonzo-locator kit of the designer. It draws its shadow two cells right
// and down, past its cells.
export const SELECTED_EVENT_DISC = {
    cells: 26,
    fillPath:
        "M9 1h8v1h-8zM7 2h12v1h-12zM5 3h16v1h-16zM4 4h18v1h-18zM3 5h20v1h-20zM3 6h20v1h-20zM2 7h22v1h-22zM2 8h22v1h-22zM1 9h24v1h-24zM1 10h24v1h-24zM1 11h24v1h-24zM1 12h24v1h-24zM1 13h24v1h-24zM1 14h24v1h-24zM1 15h24v1h-24zM1 16h24v1h-24zM2 17h22v1h-22zM2 18h22v1h-22zM3 19h20v1h-20zM3 20h20v1h-20zM4 21h18v1h-18zM5 22h16v1h-16zM7 23h12v1h-12zM9 24h8v1h-8z",
    ringPath:
        "M9 0h8v1h-8zM7 1h2v1h-2zM17 1h2v1h-2zM5 2h2v1h-2zM19 2h2v1h-2zM4 3h1v1h-1zM21 3h1v1h-1zM3 4h1v1h-1zM22 4h1v1h-1zM2 5h1v1h-1zM23 5h1v1h-1zM2 6h1v1h-1zM23 6h2v1h-2zM1 7h1v1h-1zM24 7h1v1h-1zM1 8h1v1h-1zM24 8h2v1h-2zM0 9h1v1h-1zM25 9h1v1h-1zM0 10h1v1h-1zM25 10h1v1h-1zM0 11h1v1h-1zM25 11h1v1h-1zM0 12h1v1h-1zM25 12h1v1h-1zM0 13h1v1h-1zM25 13h1v1h-1zM0 14h1v1h-1zM25 14h1v1h-1zM0 15h1v1h-1zM25 15h1v1h-1zM0 16h1v1h-1zM25 16h1v1h-1zM1 17h1v1h-1zM24 17h2v1h-2zM1 18h1v1h-1zM24 18h1v1h-1zM2 19h1v1h-1zM23 19h2v1h-2zM2 20h1v1h-1zM23 20h1v1h-1zM3 21h1v1h-1zM22 21h2v1h-2zM4 22h1v1h-1zM21 22h2v1h-2zM5 23h2v1h-2zM19 23h3v1h-3zM6 24h3v1h-3zM17 24h3v1h-3zM8 25h10v1h-10z",
    shadowPath:
        "M25 7h1v1h-1zM26 9h1v1h-1zM26 10h1v1h-1zM26 11h2v1h-2zM26 12h2v1h-2zM26 13h2v1h-2zM26 14h2v1h-2zM26 15h2v1h-2zM26 16h2v1h-2zM26 17h2v1h-2zM25 18h3v1h-3zM25 19h2v1h-2zM24 20h3v1h-3zM24 21h2v1h-2zM23 22h3v1h-3zM22 23h3v1h-3zM20 24h4v1h-4zM7 25h1v1h-1zM18 25h5v1h-5zM9 26h12v1h-12zM11 27h8v1h-8z",
}

// Shift down from the bottom of a pin to the center of its disc, where the kit anchors the pin.
// A selected disc keeps this center.
export const PIN_DISC_RADIUS_PX = (EVENT_DISC.cells * MARKER_CELL_PX) / 2

interface PinIcon {
    // Side of the icon grid, in icon cells
    cells: number
    // Side of one icon cell in px, which the kit sets by hand for each icon
    cellPx: number
    // Place of the icon grid in px from the corner of `EVENT_DISC`, optical correction included
    left: number
    top: number
    path: string
}

// The category icons of the kit and their place in the disc. A selected disc moves them by
// half the growth of the disc.
export const PIN_ICONS: Record<CategoryIcon, PinIcon> = {
    art: {
        cells: 12,
        cellPx: 1.8333,
        left: 10.925,
        top: 11.467,
        path: "M0 1h12v1h-12zM0 2h1v1h-1zM11 2h1v1h-1zM0 3h1v1h-1zM7 3h2v1h-2zM11 3h1v1h-1zM0 4h1v1h-1zM7 4h2v1h-2zM11 4h1v1h-1zM0 5h1v1h-1zM11 5h1v1h-1zM0 6h1v1h-1zM4 6h1v1h-1zM11 6h1v1h-1zM0 7h1v1h-1zM3 7h3v1h-3zM8 7h1v1h-1zM11 7h1v1h-1zM0 8h1v1h-1zM2 8h8v1h-8zM11 8h1v1h-1zM0 9h12v1h-12z",
    },
    food: {
        cells: 12,
        cellPx: 1.8333,
        left: 10.777,
        top: 12.951,
        path: "M1 0h1v1h-1zM3 0h1v1h-1zM5 0h1v1h-1zM10 0h1v1h-1zM1 1h1v1h-1zM3 1h1v1h-1zM5 1h1v1h-1zM9 1h2v1h-2zM1 2h1v1h-1zM3 2h1v1h-1zM5 2h1v1h-1zM9 2h2v1h-2zM1 3h5v1h-5zM9 3h2v1h-2zM2 4h3v1h-3zM9 4h2v1h-2zM3 5h1v1h-1zM9 5h2v1h-2zM3 6h1v1h-1zM10 6h1v1h-1zM3 7h1v1h-1zM10 7h1v1h-1zM3 8h1v1h-1zM10 8h1v1h-1zM3 9h1v1h-1zM10 9h1v1h-1zM3 10h1v1h-1zM10 10h1v1h-1z",
    },
    cinema: {
        cells: 12,
        cellPx: 1.8333,
        left: 11.536,
        top: 10.728,
        path: "M1 1h3v1h-3zM6 1h3v1h-3zM0 2h1v1h-1zM4 2h2v1h-2zM9 2h1v1h-1zM0 3h1v1h-1zM2 3h1v1h-1zM4 3h2v1h-2zM7 3h1v1h-1zM9 3h1v1h-1zM0 4h1v1h-1zM4 4h2v1h-2zM9 4h1v1h-1zM1 5h3v1h-3zM6 5h3v1h-3zM0 6h9v1h-9zM0 7h1v1h-1zM8 7h1v1h-1zM10 7h2v1h-2zM0 8h1v1h-1zM2 8h2v1h-2zM8 8h4v1h-4zM0 9h1v1h-1zM8 9h1v1h-1zM10 9h2v1h-2zM0 10h9v1h-9z",
    },
    comedy: {
        cells: 12,
        cellPx: 2,
        left: 10,
        top: 10.8,
        path: "M3 0h6v1h-6zM2 1h1v1h-1zM9 1h1v1h-1zM1 2h1v1h-1zM10 2h1v1h-1zM0 3h1v1h-1zM3 3h2v1h-2zM7 3h2v1h-2zM11 3h1v1h-1zM0 4h1v1h-1zM11 4h1v1h-1zM0 5h1v1h-1zM2 5h8v1h-8zM11 5h1v1h-1zM0 6h1v1h-1zM2 6h1v1h-1zM9 6h1v1h-1zM11 6h1v1h-1zM0 7h1v1h-1zM3 7h1v1h-1zM8 7h1v1h-1zM11 7h1v1h-1zM1 8h1v1h-1zM4 8h4v1h-4zM10 8h1v1h-1zM2 9h1v1h-1zM9 9h1v1h-1zM3 10h6v1h-6z",
    },
    party: {
        cells: 12,
        cellPx: 2,
        left: 10.889,
        top: 11.421,
        path: "M3 0h5v1h-5zM2 1h7v1h-7zM1 2h2v1h-2zM5 2h5v1h-5zM1 3h1v1h-1zM3 3h7v1h-7zM1 4h9v1h-9zM1 5h9v1h-9zM2 6h7v1h-7zM3 7h5v1h-5zM4 8h3v1h-3zM5 9h1v1h-1zM6 10h1v1h-1zM5 11h1v1h-1z",
    },
    talk: {
        cells: 12,
        cellPx: 1.8333,
        left: 11.189,
        top: 11.566,
        path: "M1 1h10v1h-10zM0 2h1v1h-1zM11 2h1v1h-1zM0 3h1v1h-1zM11 3h1v1h-1zM0 4h1v1h-1zM11 4h1v1h-1zM0 5h1v1h-1zM11 5h1v1h-1zM0 6h1v1h-1zM11 6h1v1h-1zM0 7h1v1h-1zM11 7h1v1h-1zM1 8h2v1h-2zM5 8h6v1h-6zM2 9h1v1h-1zM4 9h1v1h-1zM2 10h2v1h-2z",
    },
    market: {
        cells: 12,
        cellPx: 2.1667,
        left: 9,
        top: 8.364,
        path: "M4 2h4v1h-4zM3 3h1v1h-1zM8 3h1v1h-1zM2 4h1v1h-1zM9 4h1v1h-1zM0 5h12v1h-12zM1 6h1v1h-1zM4 6h1v1h-1zM7 6h1v1h-1zM10 6h1v1h-1zM1 7h10v1h-10zM1 8h1v1h-1zM4 8h1v1h-1zM7 8h1v1h-1zM10 8h1v1h-1zM2 9h8v1h-8z",
    },
    music: {
        cells: 7,
        cellPx: 3,
        left: 11.75,
        top: 11.333,
        path: "M3 0h2v1h-2zM3 1h3v1h-3zM3 2h1v1h-1zM5 2h2v1h-2zM3 3h1v1h-1zM1 4h3v1h-3zM0 5h4v1h-4zM1 6h2v1h-2z",
    },
    sport: {
        cells: 12,
        cellPx: 1.8333,
        left: 10.992,
        top: 10.666,
        path: "M4 0h4v1h-4zM2 1h1v1h-1zM9 1h1v1h-1zM1 2h2v1h-2zM10 2h1v1h-1zM1 3h1v1h-1zM4 3h4v1h-4zM10 3h1v1h-1zM0 4h1v1h-1zM4 4h4v1h-4zM10 4h2v1h-2zM0 5h1v1h-1zM4 5h4v1h-4zM10 5h2v1h-2zM0 6h1v1h-1zM5 6h2v1h-2zM11 6h1v1h-1zM0 7h3v1h-3zM11 7h1v1h-1zM1 8h3v1h-3zM8 8h3v1h-3zM1 9h3v1h-3zM7 9h4v1h-4zM2 10h2v1h-2zM7 10h3v1h-3zM4 11h4v1h-4z",
    },
    theatre: {
        cells: 12,
        cellPx: 1.8333,
        left: 11,
        top: 11.708,
        path: "M0 1h12v1h-12zM0 2h12v1h-12zM0 3h2v1h-2zM4 3h4v1h-4zM10 3h2v1h-2zM0 4h12v1h-12zM0 5h12v1h-12zM1 6h2v1h-2zM4 6h4v1h-4zM9 6h2v1h-2zM1 7h3v1h-3zM8 7h3v1h-3zM2 8h8v1h-8zM3 9h6v1h-6zM4 10h4v1h-4z",
    },
    other: {
        cells: 12,
        cellPx: 1.6667,
        left: 12,
        top: 12,
        path: "M0 5h2v1h-2zM5 5h2v1h-2zM10 5h2v1h-2zM0 6h2v1h-2zM5 6h2v1h-2zM10 6h2v1h-2z",
    },
}

/**
 * @description Builds the SVG path data of runs of cells, one rectangle per run
 * @param runs Runs as `x y length`, comma-separated
 * @param shiftX Cells the path moves right
 */
export const runsPathOf = (runs: string, shiftX = 0): string =>
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
    // The band between the two ink rings, flush with both, that the progress ring fills
    bandPath: cellsPathOf(CLUSTER_REACH, distance => distance > 11 && distance <= 13),
}
