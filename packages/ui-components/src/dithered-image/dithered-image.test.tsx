import { describe, expect, it } from "vitest"

import { render, screen } from "../test/test-utils"
import { DitheredImage } from "./dithered-image"
import { ditherPixels, parseHexColor } from "./dithered-image.helper"

const dark = [12, 30, 24] as const
const light = [246, 72, 30] as const

describe("parseHexColor", () => {
    it("reads a #rrggbb color", () => {
        expect(parseHexColor(" #0c1e18 ")).toStrictEqual([12, 30, 24])
    })

    it("refuses any other syntax", () => {
        expect(parseHexColor("rgb(12 30 24)")).toBeUndefined()
        expect(parseHexColor("#abc")).toBeUndefined()
    })
})

describe("ditherPixels", () => {
    it("maps white to the light color and black to the dark color", () => {
        const white = new Uint8ClampedArray([255, 255, 255, 255])
        const black = new Uint8ClampedArray([0, 0, 0, 128])
        expect([...ditherPixels(white, 1, dark, light)]).toStrictEqual([...light, 255])
        expect([...ditherPixels(black, 1, dark, light)]).toStrictEqual([...dark, 255])
    })

    it("mixes both colors on a mid gray", () => {
        const gray = new Uint8ClampedArray(Array.from({ length: 16 * 4 }, () => 128))
        const result = ditherPixels(gray, 4, dark, light)
        const reds = Array.from({ length: 16 }, (_, pixel) => result[pixel * 4])
        expect(reds).toContain(dark[0])
        expect(reds).toContain(light[0])
    })
})

describe("DitheredImage", () => {
    it("renders the plain image with its alt text", () => {
        render(<DitheredImage src="photo.png" alt="Trio on stage" />)
        expect(screen.getByRole("img", { name: "Trio on stage" })).toBeInTheDocument()
    })
})
