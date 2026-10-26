import { uniqBy } from "es-toolkit"

// Pixel shapes of the public clients. A profile lists the inset of each 1 px row of one stepped
// corner, from the edge row inward. Steps fall on a grid of `PIXEL_CELL` px. The web draws them
// as the `--pixel-*-outer` polygons of `packages/styles/src/globals.css`.

export const PIXEL_CELL = 3

export const PIXEL_CIRCLE_SIZES = [32, 36, 40, 48] as const

export type PixelCircleSize = (typeof PIXEL_CIRCLE_SIZES)[number]

/**
 * @description Maps the insets of each cell row to the insets of each 1 px row
 * @param cells Inset of each cell row, in cells
 */
const cellRowsOf = (cells: readonly number[]): number[] =>
    cells.flatMap(inset => Array.from({ length: PIXEL_CELL }, () => inset * PIXEL_CELL))

export const PIXEL_CORNER_PROFILE = cellRowsOf([2, 1])

/**
 * @description Builds the profile of a stepped circle: each cell row takes the inset of the circle at its middle, rounded to whole cells
 * @param size Diameter in px
 */
export const pixelCircleProfile = (size: number): number[] => {
    const radius = size / 2
    const cells = Array.from({ length: Math.floor(radius / PIXEL_CELL) }, (_, row) => {
        const rise = radius - (row + 0.5) * PIXEL_CELL
        return Math.round((radius - Math.sqrt(radius ** 2 - rise ** 2)) / PIXEL_CELL)
    })
    return cellRowsOf(cells.slice(0, cells.findLastIndex(inset => inset > 0) + 1))
}

export const PIXEL_CIRCLE_PROFILES: Record<PixelCircleSize, number[]> = {
    32: pixelCircleProfile(32),
    36: pixelCircleProfile(36),
    40: pixelCircleProfile(40),
    48: pixelCircleProfile(48),
}

export type CellCorner = readonly [number, number]

/**
 * @description Returns the corner of the grid cell whose middle lies nearest an offset from the center
 * @param offset Offset from the center on one axis
 */
const cellCornerOf = (offset: number): number =>
    Math.round((offset - PIXEL_CELL / 2) / PIXEL_CELL) * PIXEL_CELL

/**
 * @description Builds the top-left corners of the cells of a dotted ring around a center, a cell and a gap apart along the circle, mirrored across both axes
 * @param radius Distance from the center to the middle of each cell
 */
export const dottedRing = (radius: number): CellCorner[] => {
    const perQuadrant = Math.round((Math.PI * radius) / (4 * PIXEL_CELL))
    // Half a step off the axes, so no dot straddles an axis
    const quadrant = Array.from({ length: perQuadrant }, (_, dot): CellCorner => {
        const angle = ((Math.PI / 2) * (dot + 0.5)) / perQuadrant
        return [
            cellCornerOf(radius * Math.sin(angle)),
            cellCornerOf(-radius * Math.cos(angle)),
        ]
    })
    const corners = quadrant.flatMap(([x, y]): CellCorner[] => [
        [x, y],
        [-x - PIXEL_CELL, y],
        [-x - PIXEL_CELL, -y - PIXEL_CELL],
        [x, -y - PIXEL_CELL],
    ])
    return uniqBy(corners, ([x, y]) => `${String(x)} ${String(y)}`)
}

/**
 * @description Builds the SVG path data of one grid cell at each corner
 * @param corners Top-left corners of the cells
 */
export const cellsPath = (corners: readonly CellCorner[]): string =>
    corners
        .map(
            ([x, y]) =>
                `M${String(x)} ${String(y)}h${String(PIXEL_CELL)}v${String(PIXEL_CELL)}h-${String(PIXEL_CELL)}z`,
        )
        .join("")

/**
 * @description Returns the SVG view box of a square around the origin
 * @param reach Distance from the origin to each side
 */
const centeredViewBox = (reach: number): string =>
    `${String(-reach)} ${String(-reach)} ${String(2 * reach)} ${String(2 * reach)}`

export const LIVE_WAVE_PERIOD_MS = 1000

// Rings of the live wave, inner first. Each radius is a whole number of cells plus 1 px, so the
// ring falls on the grid alike on every side.
const LIVE_WAVE = [
    { radius: 25, fade: 1 },
    { radius: 31, fade: 0.8 },
    { radius: 37, fade: 0.6 },
    { radius: 43, fade: 0.45 },
] as const

export const LIVE_WAVE_RINGS = LIVE_WAVE.map(({ radius, fade }, index) => {
    // Half the side of the square that holds the ring
    const reach = radius + 2 * PIXEL_CELL
    return {
        radius,
        fade,
        reach,
        viewBox: centeredViewBox(reach),
        path: cellsPath(dottedRing(radius)),
        // Negative, so every ring starts mid cycle and the wave runs from the first frame
        delayMs: (index / LIVE_WAVE.length - 1) * LIVE_WAVE_PERIOD_MS,
    }
})

// Thresholds of a 4×4 ordered dither, in sixteenths
const BAYER_4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
] as const

/**
 * @description Returns the ordered-dither threshold of a grid cell, between 0 and 1
 * @param column Cell column, any integer
 * @param row Cell row, any integer
 */
const bayerThreshold = (column: number, row: number): number =>
    // `at` counts a negative remainder from the end, as a true modulo would
    ((BAYER_4.at(row % 4)?.at(column % 4) ?? 0) + 0.5) / 16

/**
 * @description Builds the top-left corners of the cells of a dithered disc around a center, solid at the core and thinning out to nothing at the radius
 * @param radius Distance from the center where the disc ends
 * @param coreRadius Distance from the center up to which every cell is on
 */
export const ditherHalo = (radius: number, coreRadius: number): CellCorner[] => {
    const span = Math.ceil(radius / PIXEL_CELL)
    const indexes = Array.from({ length: 2 * span }, (_, index) => index - span)
    return indexes.flatMap(row =>
        indexes
            .filter(column => {
                const distance = Math.hypot(
                    (column + 0.5) * PIXEL_CELL,
                    (row + 0.5) * PIXEL_CELL,
                )
                const density = (radius - distance) / (radius - coreRadius)
                return density > bayerThreshold(column, row)
            })
            .map((column): CellCorner => [column * PIXEL_CELL, row * PIXEL_CELL]),
    )
}

export const POSITION_BREATH_MS = 3000

// Halo of the position dot, 16 px wide: the inner halo stays, the outer one comes and goes
const POSITION_CORE_RADIUS = 8
const POSITION_HALO_REACH = 27

export const POSITION_HALO = {
    size: 2 * POSITION_HALO_REACH,
    viewBox: centeredViewBox(POSITION_HALO_REACH),
    innerPath: cellsPath(ditherHalo(18, POSITION_CORE_RADIUS)),
    outerPath: cellsPath(ditherHalo(POSITION_HALO_REACH, POSITION_CORE_RADIUS)),
}
