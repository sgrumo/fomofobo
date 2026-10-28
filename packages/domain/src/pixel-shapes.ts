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
