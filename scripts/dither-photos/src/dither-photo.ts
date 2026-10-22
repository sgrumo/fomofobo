import {
    PHOTO_DITHER_CELL,
    PHOTO_DITHER_DARK,
    PHOTO_DITHER_LIGHT,
    PHOTO_MAX_WIDTH,
} from "models"
import { ditherGridOf, ditherIndices, encodeTwoColorPng } from "shared/image"
import sharp from "sharp"

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10] as const

/**
 * @description True when the bytes are a photo this CLI or the backoffice already stored: a 1-bit indexed PNG no wider than the stored width
 * @param bytes Object bytes read from the bucket
 */
export const isDitheredPng = (bytes: Uint8Array): boolean => {
    if (bytes.length < 33 || PNG_SIGNATURE.some((byte, index) => bytes[index] !== byte)) {
        return false
    }
    const header = new DataView(bytes.buffer, bytes.byteOffset + 16, 13)
    return (
        header.getUint32(0) <= PHOTO_MAX_WIDTH &&
        header.getUint8(8) === 1 &&
        header.getUint8(9) === 3
    )
}

/**
 * @description Builds the stored copy of a photo: oriented, scaled to the stored width and dithered in two colors, as a PNG
 * @param bytes Original photo, JPEG, PNG or WebP
 */
export const ditherPhoto = async (
    bytes: Uint8Array,
): Promise<Uint8Array<ArrayBuffer>> => {
    const oriented = await sharp(bytes).rotate().ensureAlpha().raw().toBuffer({
        resolveWithObject: true,
    })
    const grid = ditherGridOf(oriented.info, PHOTO_MAX_WIDTH, PHOTO_DITHER_CELL)
    const pixels = await sharp(oriented.data, { raw: oriented.info })
        .resize(grid.width, grid.height, { fit: "fill" })
        .raw()
        .toBuffer()
    return await encodeTwoColorPng(
        ditherIndices(new Uint8ClampedArray(pixels), grid.width),
        grid,
        [PHOTO_DITHER_DARK, PHOTO_DITHER_LIGHT],
        PHOTO_DITHER_CELL,
    )
}
