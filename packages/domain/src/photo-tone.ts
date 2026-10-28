import { PHOTO_DITHER_DARK, PHOTO_DITHER_LIGHT } from "models"
import type { VenueKind } from "models"

import type { MapPointKind } from "./event-clusters"

// A photo takes the color of the pin it belongs to
export type PhotoTone = MapPointKind

type Rgb = readonly [number, number, number]

// `--palette-red`, `--palette-yellow`, `--palette-gray-light` and `--palette-sky` of `styles`
export const PHOTO_TONE_COLORS: Record<PhotoTone, Rgb> = {
    live: PHOTO_DITHER_LIGHT,
    upcoming: [255, 210, 63],
    ended: [203, 203, 198],
    permanent: [166, 220, 255],
}

/**
 * @description Returns a channel of an sRGB color in linear light, between 0 and 1
 * @param channel Channel between 0 and 255
 */
const linearOf = (channel: number): number => {
    const unit = channel / 255
    return unit <= 0.04045 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4
}

/**
 * @description Returns an sRGB color in linear light
 * @param color Color, channels between 0 and 255
 */
const linearRgbOf = ([red, green, blue]: Rgb): Rgb => [
    linearOf(red),
    linearOf(green),
    linearOf(blue),
]

/**
 * @description Builds the values of an SVG `feColorMatrix` that keeps the dark color of a dithered photo and turns its light color into the tone
 * @param tone Tone of the photo
 * @remarks Works in linear RGB, the default space of SVG filters, so the filter takes no `color-interpolation-filters`
 */
export const photoToneMatrix = (tone: PhotoTone): string => {
    const [darkRed, darkGreen, darkBlue] = linearRgbOf(PHOTO_DITHER_DARK)
    const [lightRed] = linearRgbOf(PHOTO_DITHER_LIGHT)
    const [toneRed, toneGreen, toneBlue] = linearRgbOf(PHOTO_TONE_COLORS[tone])
    // The red channel alone tells the two colors apart: each channel follows it
    const rowOf = (dark: number, toned: number) => {
        const gain = (toned - dark) / (lightRed - darkRed)
        return [gain, 0, 0, 0, dark - gain * darkRed]
    }
    return [
        ...rowOf(darkRed, toneRed),
        ...rowOf(darkGreen, toneGreen),
        ...rowOf(darkBlue, toneBlue),
        0,
        0,
        0,
        1,
        0,
    ].join(" ")
}

/**
 * @description Returns the tone of the photos of a venue: the permanent color for a permanent venue, else the default red
 * @param kind Kind of the venue
 */
export const venuePhotoToneOf = (kind: VenueKind): PhotoTone =>
    kind === "regular" ? "live" : "permanent"
