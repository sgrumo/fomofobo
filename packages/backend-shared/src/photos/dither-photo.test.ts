import { encodeTwoColorPng } from "shared/image"
import sharp from "sharp"
import { describe, expect, it } from "vitest"

import { ditherPhoto, isDitheredPng } from "./dither-photo"

describe("isDitheredPng", () => {
    it("accepts a 1-bit indexed PNG no wider than the stored width", async () => {
        const stored = await encodeTwoColorPng(
            new Uint8Array(400 * 2),
            { width: 400, height: 2 },
            [
                [0, 0, 0],
                [255, 255, 255],
            ],
            3,
        )

        expect(isDitheredPng(stored)).toBe(true)
    })

    it("refuses a 1-bit PNG past the stored width, a full-color PNG and other bytes", async () => {
        const wide = await encodeTwoColorPng(
            new Uint8Array(401 * 2),
            { width: 401, height: 2 },
            [
                [0, 0, 0],
                [255, 255, 255],
            ],
            3,
        )
        const fullColor = await sharp({
            create: { width: 10, height: 10, channels: 3, background: "#f6481e" },
        })
            .png()
            .toBuffer()

        expect(isDitheredPng(wide)).toBe(false)
        expect(isDitheredPng(new Uint8Array(fullColor))).toBe(false)
        expect(isDitheredPng(crypto.getRandomValues(new Uint8Array(64)))).toBe(false)
    })
})

describe("ditherPhoto", () => {
    it("scales a large JPEG to the stored width and writes a dithered PNG", async () => {
        const jpeg = await sharp({
            create: { width: 3000, height: 2000, channels: 3, background: "#808080" },
        })
            .jpeg()
            .toBuffer()

        const png = await ditherPhoto(new Uint8Array(jpeg))
        const metadata = await sharp(png).metadata()

        expect(isDitheredPng(png)).toBe(true)
        expect([metadata.width, metadata.height]).toStrictEqual([1200, 800])
    })
})
