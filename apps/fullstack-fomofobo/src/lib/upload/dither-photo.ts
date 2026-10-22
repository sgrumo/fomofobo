import {
    PHOTO_DITHER_CELL,
    PHOTO_DITHER_DARK,
    PHOTO_DITHER_LIGHT,
    PHOTO_MAX_WIDTH,
} from "models"
import { ditherGridOf, ditherIndices, encodeTwoColorPng } from "shared/image"

/**
 * @description Builds the stored copy of a picked photo: scaled to the stored width and dithered in two colors, as a PNG
 * @param file Photo picked, any image type the browser decodes
 * @throws When the browser has no 2D canvas context
 */
export const ditherPhoto = async (file: Blob): Promise<Blob> => {
    const bitmap = await createImageBitmap(file)
    const grid = ditherGridOf(bitmap, PHOTO_MAX_WIDTH, PHOTO_DITHER_CELL)
    const context = new OffscreenCanvas(grid.width, grid.height).getContext("2d", {
        willReadFrequently: true,
    })
    try {
        if (context === null) {
            throw new Error("No 2D canvas context")
        }
        context.imageSmoothingQuality = "high"
        context.drawImage(bitmap, 0, 0, grid.width, grid.height)
    } finally {
        bitmap.close()
    }
    const pixels = context.getImageData(0, 0, grid.width, grid.height)
    const png = await encodeTwoColorPng(
        ditherIndices(pixels.data, grid.width),
        grid,
        [PHOTO_DITHER_DARK, PHOTO_DITHER_LIGHT],
        PHOTO_DITHER_CELL,
    )
    return new Blob([png], { type: "image/png" })
}
