import type { Size } from "shared/image"

export const FALLBACK_GRID: Size = { width: 200, height: 105 }
// Cells of one icon pixel: the 12 x 12 icon spans 72 x 72 cells
export const ICON_SCALE = 6
// Cells of ground kept clear of dots around the icon
const ICON_MARGIN = 6
const DOT_STEP = 4

/**
 * @description Builds the cells of a fallback image: a sparse dark dot dither on a light ground,
 * cleared around the icon, which is drawn dark and centered on its filled cells
 * @param bitmap Icon rows, `#` filled and `.` empty
 */
export const fallbackGrid = (bitmap: readonly string[]): Uint8Array => {
    const filled = bitmap.flatMap((row, y) =>
        [...row.matchAll(/#/gu)].map(cell => ({ x: cell.index, y })),
    )
    const minX = Math.min(...filled.map(cell => cell.x))
    const minY = Math.min(...filled.map(cell => cell.y))
    const iconWidth = (Math.max(...filled.map(cell => cell.x)) - minX + 1) * ICON_SCALE
    const iconHeight = (Math.max(...filled.map(cell => cell.y)) - minY + 1) * ICON_SCALE
    const left = Math.floor((FALLBACK_GRID.width - iconWidth) / 2)
    const top = Math.floor((FALLBACK_GRID.height - iconHeight) / 2)
    const iconPixels = new Set(filled.map(cell => `${String(cell.x)}:${String(cell.y)}`))

    return Uint8Array.from(
        { length: FALLBACK_GRID.width * FALLBACK_GRID.height },
        (_, index) => {
            const x = index % FALLBACK_GRID.width
            const y = Math.floor(index / FALLBACK_GRID.width)
            const iconX = minX + Math.floor((x - left) / ICON_SCALE)
            const iconY = minY + Math.floor((y - top) / ICON_SCALE)
            const inIcon =
                x >= left &&
                x < left + iconWidth &&
                y >= top &&
                y < top + iconHeight &&
                iconPixels.has(`${String(iconX)}:${String(iconY)}`)
            const nearIcon =
                x >= left - ICON_MARGIN &&
                x < left + iconWidth + ICON_MARGIN &&
                y >= top - ICON_MARGIN &&
                y < top + iconHeight + ICON_MARGIN
            // Every other dot row shifts by half a step: the dots sit on a diagonal lattice.
            const dot =
                y % DOT_STEP === 0 &&
                (x + (y / DOT_STEP) * (DOT_STEP / 2)) % DOT_STEP === 0
            return inIcon || (dot && !nearIcon) ? 0 : 1
        },
    )
}
