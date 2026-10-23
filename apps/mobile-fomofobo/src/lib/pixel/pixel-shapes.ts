// Row insets of one stepped corner, from the edge row inward, on a 1 pt grid. They mirror the
// `--pixel-*-outer` polygons of `packages/styles/src/globals.css`.

export const PIXEL_CORNER_PROFILE = [5, 3, 2, 1, 1] as const

export const PIXEL_CIRCLE_PROFILES = {
    32: [12, 9, 7, 6, 5, 4, 3, 2, 2, 1, 1, 1],
    36: [14, 11, 9, 7, 6, 5, 4, 3, 3, 2, 2, 1, 1, 1],
    40: [16, 12, 10, 9, 7, 6, 5, 4, 4, 3, 2, 2, 1, 1, 1, 1],
    48: [19, 16, 13, 12, 10, 9, 8, 7, 6, 5, 4, 4, 3, 2, 2, 2, 1, 1, 1],
} as const

export type PixelCircleSize = keyof typeof PIXEL_CIRCLE_PROFILES

export const PIXEL_RING_WIDTH = 2

type Point = readonly [number, number]

/**
 * @description Returns the corner profile of the shape that the 2 pt ring leaves inside a profile
 * @param profile Row insets of the outer corner
 */
export const innerProfile = (profile: readonly number[]): number[] => {
    const rows = profile.map((inset, row) =>
        Math.max(profile[row + PIXEL_RING_WIDTH] ?? 0, inset - PIXEL_RING_WIDTH),
    )
    return rows.slice(0, rows.findLastIndex(inset => inset > 0) + 1)
}

/**
 * @description True when the middle point lies on the straight line of its two neighbors
 * @param previous Point before
 * @param point Point checked
 * @param next Point after
 */
const isCollinear = (previous: Point, point: Point, next: Point) =>
    (previous[0] === point[0] && point[0] === next[0]) ||
    (previous[1] === point[1] && point[1] === next[1])

/**
 * @description Builds the clockwise outline of a box with four stepped corners
 * @param width Box width in points
 * @param height Box height in points
 * @param profile Row insets of one corner
 */
export const steppedPolygon = (
    width: number,
    height: number,
    profile: readonly number[],
): Point[] => {
    const topLeft = [...profile.keys()]
        .toReversed()
        .flatMap((row): Point[] => [
            [profile[row + 1] ?? 0, row + 1],
            [profile[row] ?? 0, row + 1],
        ])
        .concat([[profile[0] ?? 0, 0]])
    const outline = [
        ...topLeft,
        ...topLeft.map(([x, y]): Point => [width - x, y]).toReversed(),
        ...topLeft.map(([x, y]): Point => [width - x, height - y]),
        ...topLeft.map(([x, y]): Point => [x, height - y]).toReversed(),
    ]
    const distinct = outline.filter(
        (point, index) =>
            point[0] !== outline.at(index - 1)?.[0] ||
            point[1] !== outline.at(index - 1)?.[1],
    )
    return distinct.filter(
        (point, index) =>
            !isCollinear(
                distinct.at(index - 1) ?? point,
                point,
                distinct[(index + 1) % distinct.length] ?? point,
            ),
    )
}

/**
 * @description Builds the SVG path data of a stepped box, moved by an offset
 * @param width Box width in points
 * @param height Box height in points
 * @param profile Row insets of one corner
 * @param offset Distance moved right and down
 */
export const steppedPath = (
    width: number,
    height: number,
    profile: readonly number[],
    offset = 0,
): string =>
    `M${steppedPolygon(width, height, profile)
        .map(([x, y]) => `${String(x + offset)} ${String(y + offset)}`)
        .join(" L")} Z`

// Degrees of one dash and of one gap of a dashed ring, the `repeating-conic-gradient` of the web
const DASH_DEGREES = 15

/**
 * @description Builds the SVG path data of the dash wedges of a dashed ring: one triangle per
 * dash, clockwise from 12 o'clock, reaching past the corners of the box
 * @param width Box width in points
 * @param height Box height in points
 * @param offset Distance moved right and down
 */
export const dashWedgesPath = (width: number, height: number, offset = 0): string => {
    const centerX = width / 2 + offset
    const centerY = height / 2 + offset
    const reach = width + height
    const pointAt = (degrees: number) => {
        const radians = (degrees * Math.PI) / 180
        return `${String(centerX + reach * Math.sin(radians))} ${String(centerY - reach * Math.cos(radians))}`
    }
    return Array.from({ length: 360 / (2 * DASH_DEGREES) }, (_, dash) => {
        const from = dash * 2 * DASH_DEGREES
        return `M${String(centerX)} ${String(centerY)} L${pointAt(from)} L${pointAt(from + DASH_DEGREES)} Z`
    }).join(" ")
}
