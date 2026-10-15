export type Rgb = readonly [number, number, number]

const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const

/**
 * @description Returns the channels of a `#rrggbb` color
 * @param hex Color string read from a CSS custom property
 * @remarks Returns `undefined` for any other color syntax
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
 * @description Maps RGBA pixels to a two-color ordered dither (Bayer 4 x 4) on luminance
 * @param source RGBA bytes, four per pixel
 * @param width Pixels per row
 * @param dark Color of the pixels under the threshold
 * @param light Color of the pixels over the threshold
 */
export const ditherPixels = (
    source: Uint8ClampedArray,
    width: number,
    dark: Rgb,
    light: Rgb,
): Uint8ClampedArray<ArrayBuffer> =>
    Uint8ClampedArray.from({ length: source.length }, (_, index) => {
        const channel = index % 4
        if (channel === 3) {
            return 255
        }
        const pixel = index - channel
        const luminance =
            0.2126 * (source[pixel] ?? 0) +
            0.7152 * (source[pixel + 1] ?? 0) +
            0.0722 * (source[pixel + 2] ?? 0)
        const x = (pixel / 4) % width
        const y = Math.floor(pixel / 4 / width)
        const threshold = (((BAYER_4[(y % 4) * 4 + (x % 4)] ?? 0) + 0.5) / 16) * 255
        const color = luminance > threshold ? light : dark
        return color[channel] ?? 0
    })
