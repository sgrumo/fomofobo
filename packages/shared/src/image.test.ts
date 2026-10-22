import { describe, expect, it } from "vitest"

import {
    ditherGridOf,
    ditherIndices,
    encodeTwoColorPng,
    parseHexColor,
    transformBytes,
} from "./image"
import type { Rgb } from "./image"

const INK: Rgb = [12, 30, 24]
const RED: Rgb = [246, 72, 30]

describe("parseHexColor", () => {
    it.each([
        { hex: "#0c1e18", expected: [12, 30, 24] },
        { hex: " #F6481E ", expected: [246, 72, 30] },
        { hex: "rgb(1, 2, 3)", expected: undefined },
        { hex: "#fff", expected: undefined },
    ])("reads $hex", ({ hex, expected }) => {
        expect(parseHexColor(hex)).toStrictEqual(expected)
    })
})

describe("ditherGridOf", () => {
    it.each([
        { source: { width: 3000, height: 2000 }, expected: { width: 400, height: 267 } },
        { source: { width: 2000, height: 3000 }, expected: { width: 400, height: 600 } },
        { source: { width: 300, height: 150 }, expected: { width: 100, height: 50 } },
        { source: { width: 2, height: 1 }, expected: { width: 1, height: 1 } },
    ])("fits $source.width x $source.height", ({ source, expected }) => {
        expect(ditherGridOf(source, 1200, 3)).toStrictEqual(expected)
    })
})

describe("ditherIndices", () => {
    it("maps white to light and black to dark, whatever the threshold", () => {
        const white = new Uint8ClampedArray(16 * 4).fill(255)
        const black = Uint8ClampedArray.from(
            Array.from({ length: 16 }).flatMap(() => [0, 0, 0, 255]),
        )

        expect([...ditherIndices(white, 4)]).toStrictEqual(
            Array.from({ length: 16 }, () => 1),
        )
        expect([...ditherIndices(black, 4)]).toStrictEqual(
            Array.from({ length: 16 }, () => 0),
        )
    })

    it("lights half of a mid-gray 4 x 4 block", () => {
        const gray = Uint8ClampedArray.from(
            Array.from({ length: 16 }).flatMap(() => [128, 128, 128, 255]),
        )

        const lit = ditherIndices(gray, 4).reduce((sum, index) => sum + index, 0)

        expect(lit).toBe(8)
    })
})

describe("encodeTwoColorPng", () => {
    it("writes a 1-bit indexed PNG with the palette and each cell scaled up", async () => {
        const png = await encodeTwoColorPng(
            Uint8Array.from([1, 0]),
            { width: 2, height: 1 },
            [INK, RED],
            2,
        )
        const view = new DataView(png.buffer)
        const idatLength = view.getUint32(8 + 25 + 18)
        const idat = png.slice(8 + 25 + 18 + 8, 8 + 25 + 18 + 8 + idatLength)
        const scanlines = await transformBytes(idat, new DecompressionStream("deflate"))

        expect(png.slice(0, 8)).toStrictEqual(
            Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]),
        )
        expect(new TextDecoder().decode(png.slice(12, 16))).toBe("IHDR")
        expect([view.getUint32(16), view.getUint32(20)]).toStrictEqual([4, 2])
        expect(png.slice(24, 29)).toStrictEqual(Uint8Array.from([1, 3, 0, 0, 0]))
        expect(new TextDecoder().decode(png.slice(37, 41))).toBe("PLTE")
        expect(png.slice(41, 47)).toStrictEqual(Uint8Array.from([...INK, ...RED]))
        expect(scanlines).toStrictEqual(Uint8Array.from([0, 0b1100_0000, 0, 0b1100_0000]))
        expect(png.slice(-12)).toStrictEqual(
            Uint8Array.from([0, 0, 0, 0, 73, 69, 78, 68, 0xae, 0x42, 0x60, 0x82]),
        )
    })
})
