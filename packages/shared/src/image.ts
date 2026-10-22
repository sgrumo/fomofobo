export type Rgb = readonly [number, number, number]

export interface Size {
    width: number
    height: number
}

const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10] as const

const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, index) =>
    Array.from({ length: 8 }).reduce<number>(
        crc => (crc & 1 ? 0xed_b8_83_20 ^ (crc >>> 1) : crc >>> 1),
        index,
    ),
)

/**
 * @description Returns the channels of a `#rrggbb` color
 * @param hex Color string
 */
export const parseHexColor = (hex: string): Rgb | undefined => {
    const groups = /^#(?<red>[\da-f]{2})(?<green>[\da-f]{2})(?<blue>[\da-f]{2})$/iu.exec(
        hex.trim(),
    )?.groups
    return groups
        ? [
              Number.parseInt(groups.red ?? "", 16),
              Number.parseInt(groups.green ?? "", 16),
              Number.parseInt(groups.blue ?? "", 16),
          ]
        : undefined
}

/**
 * @description Returns the grid of dither cells of an image scaled to a maximum width, the aspect ratio kept
 * @param source Size of the source image in pixels
 * @param maxWidth Widest output in pixels
 * @param cell Side of one dither cell in output pixels
 */
export const ditherGridOf = (source: Size, maxWidth: number, cell: number): Size => {
    const width = Math.max(1, Math.round(Math.min(source.width, maxWidth) / cell))
    return {
        width,
        height: Math.max(1, Math.round((width * source.height) / source.width)),
    }
}

/**
 * @description Maps RGBA pixels to a two-color ordered dither (Bayer 4 x 4) on luminance: 0 dark, 1 light
 * @param rgba RGBA bytes, four per pixel
 * @param width Pixels per row
 */
export const ditherIndices = (
    rgba: Uint8ClampedArray,
    width: number,
): Uint8Array<ArrayBuffer> =>
    Uint8Array.from({ length: rgba.length / 4 }, (_, index) => {
        const pixel = index * 4
        const luminance =
            0.2126 * (rgba[pixel] ?? 0) +
            0.7152 * (rgba[pixel + 1] ?? 0) +
            0.0722 * (rgba[pixel + 2] ?? 0)
        const x = index % width
        const y = Math.floor(index / width)
        const threshold = (((BAYER_4[(y % 4) * 4 + (x % 4)] ?? 0) + 0.5) / 16) * 255
        return luminance > threshold ? 1 : 0
    })

/**
 * @description Returns the CRC-32 of the bytes
 * @param bytes Input bytes
 */
const crc32 = (bytes: Uint8Array): number =>
    (bytes.reduce(
        (crc, byte) => (CRC_TABLE[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8),
        0xff_ff_ff_ff,
    ) ^
        0xff_ff_ff_ff) >>>
    0

/**
 * @description Builds one PNG chunk: length, type, data and CRC
 * @param type Four-letter chunk type
 * @param data Chunk data
 */
const pngChunk = (type: string, data: Uint8Array): Uint8Array<ArrayBuffer> => {
    const chunk = new Uint8Array(data.length + 12)
    const view = new DataView(chunk.buffer)
    view.setUint32(0, data.length)
    chunk.set(new TextEncoder().encode(type), 4)
    chunk.set(data, 8)
    view.setUint32(data.length + 8, crc32(chunk.subarray(4, -4)))
    return chunk
}

/**
 * @description Builds the filtered scanlines of a 1-bit image, each index scaled up to a square of pixels
 * @param indices One 0 or 1 per cell, row by row
 * @param grid Cells per row and rows
 * @param scale Side of one cell in output pixels
 */
const scanlinesOf = (
    indices: Uint8Array,
    grid: Size,
    scale: number,
): Uint8Array<ArrayBuffer> => {
    const width = grid.width * scale
    const rowBytes = 1 + Math.ceil(width / 8)
    return Uint8Array.from({ length: grid.height * scale * rowBytes }, (_, offset) => {
        const column = offset % rowBytes
        if (column === 0) {
            return 0
        }
        const row = Math.floor(Math.floor(offset / rowBytes) / scale)
        return Array.from({ length: 8 }).reduce<number>((byte, _bit, bit) => {
            const x = (column - 1) * 8 + bit
            const on =
                x < width && indices[row * grid.width + Math.floor(x / scale)] === 1
            return on ? byte | (0x80 >> bit) : byte
        }, 0)
    })
}

/**
 * @description Returns the bytes run through a stream transform
 * @param bytes Input bytes
 * @param transform Compression or decompression stream
 */
export const transformBytes = async (
    bytes: Uint8Array<ArrayBuffer>,
    transform: CompressionStream | DecompressionStream,
): Promise<Uint8Array<ArrayBuffer>> => {
    const writer = transform.writable.getWriter()
    const [, output] = await Promise.all([
        (async () => {
            await writer.write(bytes)
            await writer.close()
        })(),
        new Response(transform.readable).arrayBuffer(),
    ])
    return new Uint8Array(output)
}

/**
 * @description Builds a 1-bit indexed PNG of a two-color image, each cell drawn as a square of pixels
 * @param indices One 0 or 1 per cell, row by row: 0 takes the dark color, 1 the light one
 * @param grid Cells per row and rows
 * @param palette Dark and light colors
 * @param scale Side of one cell in output pixels
 */
export const encodeTwoColorPng = async (
    indices: Uint8Array,
    grid: Size,
    palette: readonly [Rgb, Rgb],
    scale: number,
): Promise<Uint8Array<ArrayBuffer>> => {
    const header = new Uint8Array(13)
    const view = new DataView(header.buffer)
    view.setUint32(0, grid.width * scale)
    view.setUint32(4, grid.height * scale)
    header.set([1, 3, 0, 0, 0], 8)
    const deflated = await transformBytes(
        scanlinesOf(indices, grid, scale),
        new CompressionStream("deflate"),
    )
    const parts = [
        Uint8Array.from(PNG_SIGNATURE),
        pngChunk("IHDR", header),
        pngChunk("PLTE", Uint8Array.from(palette.flat())),
        pngChunk("IDAT", deflated),
        pngChunk("IEND", new Uint8Array(0)),
    ]
    return new Uint8Array(await new Blob(parts).arrayBuffer())
}
