import { PHOTO_DITHER_DARK, PHOTO_DITHER_LIGHT } from "models"
import { describe, expect, it } from "vitest"

import { PHOTO_TONE_COLORS, photoToneMatrix, venuePhotoToneOf } from "./photo-tone"

const linearOf = (channel: number) => {
    const unit = channel / 255
    return unit <= 0.04045 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4
}

const applied = (values: string, color: readonly number[]) => {
    const matrix = values.split(" ").map(Number)
    const input = [...color.map(linearOf), 1, 1]
    return [0, 1, 2].map(row =>
        [0, 1, 2, 3, 4].reduce(
            (sum, column) => sum + (matrix[row * 5 + column] ?? 0) * (input[column] ?? 0),
            0,
        ),
    )
}

describe("photoToneMatrix", () => {
    it.each(["live", "upcoming", "ended", "permanent"] as const)(
        "keeps the dark color and turns the light one into the %s color",
        tone => {
            const rounded = (channels: readonly number[]) =>
                channels.map(channel => Math.round(channel * 1e6))

            expect(
                rounded(applied(photoToneMatrix(tone), PHOTO_DITHER_DARK)),
            ).toStrictEqual(rounded(PHOTO_DITHER_DARK.map(linearOf)))
            expect(
                rounded(applied(photoToneMatrix(tone), PHOTO_DITHER_LIGHT)),
            ).toStrictEqual(rounded(PHOTO_TONE_COLORS[tone].map(linearOf)))
        },
    )
})

describe("venuePhotoToneOf", () => {
    it("tones a permanent venue in its color and a regular one in red", () => {
        expect([venuePhotoToneOf("cinema"), venuePhotoToneOf("regular")]).toStrictEqual([
            "permanent",
            "live",
        ])
    })
})
