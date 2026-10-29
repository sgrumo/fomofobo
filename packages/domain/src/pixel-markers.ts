// Map markers of the public clients, as the `gen.py` raster of the fomo-locator reference: cells
// on a square grid around a center, a cell in when the distance from its middle to the center
// passes a test. Paths run in cell units, and each client scales one cell to `MARKER_CELL_PX`.

export const MARKER_CELL_PX = 2

export const LIVE_WAVE_FRAME_MS = 250

export const POSITION_HALO_FRAME_MS = 200

type CellTest = (distance: number, x: number, y: number) => boolean

/**
 * @description Returns the remainder of a division with the sign of the divisor, as Python `%`
 * @param value Dividend
 * @param divisor Divisor
 */
const modOf = (value: number, divisor: number): number =>
    ((value % divisor) + divisor) % divisor

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

// Frames a ring of the wave lives, and frames between two rings
const WAVE_LIFE = 6
const WAVE_PERIOD = 4

/**
 * @description True when a cell of a wave ring of an age stays: the crest crumbles into a dither as the ring ages
 * @param age Frames since the ring left the disc
 * @param x Column offset of the cell from the center
 * @param y Row offset of the cell from the center
 */
const waveCellStays = (age: number, x: number, y: number): boolean => {
    if (age <= 1) {
        return true
    }
    if (age === 2) {
        return (
            modOf(Math.floor(x / 2) + Math.floor(y / 2), 2) === 0 || modOf(x + y, 2) === 0
        )
    }
    if (age === 3) {
        return modOf(x + y, 2) === 0
    }
    if (age === 4) {
        return modOf(x + y, 2) === 0 && modOf(x, 2) === 0
    }
    return modOf(x, 3) === 0 && modOf(y, 3) === 0
}

/**
 * @description Builds the sprite of the live wave around a disc: rings leave the disc, grow and crumble, one frame beside the other
 * @param radius Radius of the disc, in cells
 */
const liveWaveOf = (radius: number) => {
    const radii = Array.from({ length: WAVE_LIFE }, (_, age) => radius + 1.5 + 1.6 * age)
    const reach = radii.at(-1) ?? radius
    const cells = 2 * padOf(reach)
    const frames = Array.from({ length: WAVE_PERIOD }, (_, frame) =>
        cellsPathOf(
            reach,
            (distance, x, y) =>
                [frame, frame + WAVE_PERIOD].some(age => {
                    const ring = radii.at(age)
                    return (
                        ring !== undefined &&
                        distance > ring - 1 &&
                        distance <= ring &&
                        waveCellStays(age, x, y)
                    )
                }),
            frame * cells,
        ),
    )
    return { cells, frames: WAVE_PERIOD, path: frames.join("") }
}

export const LIVE_WAVE = liveWaveOf(9)

export const SELECTED_LIVE_WAVE = liveWaveOf(11)

const POSITION_REACH = 5.5

export const POSITION_CORE = {
    cells: 2 * padOf(POSITION_REACH),
    fillPath: cellsPathOf(POSITION_REACH, distance => distance <= 4),
    ringPath: cellsPathOf(
        POSITION_REACH,
        distance => distance > 4 && distance <= POSITION_REACH,
    ),
}

type HaloDensity = "full" | "checker" | "sparse" | "few"

/**
 * @description True when a cell stays in a dither of a density
 * @param density Share of the cells that stay
 * @param x Column offset of the cell from the center
 * @param y Row offset of the cell from the center
 */
const ditherStays = (density: HaloDensity, x: number, y: number): boolean => {
    if (density === "full") {
        return true
    }
    if (density === "checker") {
        return modOf(x + y, 2) === 0
    }
    if (density === "sparse") {
        return modOf(x + y, 2) === 0 && modOf(x, 2) === 0
    }
    return modOf(x, 3) === 0 && modOf(y, 3) === 0
}

// Wave of the position halo, one entry per frame: its radius and density, or no wave
const HALO_WAVE: ReadonlyArray<{ radius: number; density: HaloDensity } | undefined> = [
    { radius: 7, density: "full" },
    { radius: 9, density: "checker" },
    { radius: 11, density: "checker" },
    { radius: 12.5, density: "sparse" },
    { radius: 14, density: "few" },
    undefined,
    undefined,
]

const HALO_REACH = 14

/**
 * @description Builds the sprite of the position halo: a dithered glow, dense at the core, and a wave that leaves it and crumbles
 */
const positionHaloOf = () => {
    const cells = 2 * padOf(HALO_REACH)
    const frames = HALO_WAVE.map((wave, frame) =>
        cellsPathOf(
            HALO_REACH,
            (distance, x, y) =>
                (wave !== undefined &&
                    distance > wave.radius - 1.5 &&
                    distance <= wave.radius &&
                    ditherStays(wave.density, x, y)) ||
                (distance < 9 && ditherStays("checker", x, y)) ||
                (distance < 12 && ditherStays("sparse", x, y)),
            frame * cells,
        ),
    )
    return { cells, frames: HALO_WAVE.length, path: frames.join("") }
}

export const POSITION_HALO = positionHaloOf()

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
