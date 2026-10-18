import { describe, expect, it } from "vitest"

import { render } from "../test/test-utils"
import { PixelIcon, PixelIconSearch } from "./pixel-icons"
import {
    PIXEL_ICON_GRID,
    pixelIconBitmaps,
    pixelIconCenteredViewBox,
    pixelIconNames,
    pixelIconPath,
} from "./pixel-icons.helper"

describe("pixelIconPath", () => {
    it("draws one rectangle per horizontal run", () => {
        expect(pixelIconPath(["#.##", "..#."])).toBe(
            "M0 0h1v1h-1zM2 0h2v1h-2zM2 1h1v1h-1z",
        )
    })

    it("draws nothing for an empty bitmap", () => {
        expect(pixelIconPath(["....", "...."])).toBe("")
    })
})

describe("pixelIconCenteredViewBox", () => {
    it("shifts the box so that the filled cells sit in its middle", () => {
        const leftTop = [
            "##..........",
            "##..........",
            ...Array.from({ length: 10 }, () => "............"),
        ]
        expect(pixelIconCenteredViewBox(leftTop)).toBe("-5 -5 12 12")
    })

    it("keeps the grid of a bitmap that is centered already, or empty", () => {
        const empty = Array.from({ length: 5 }, () => "............")
        const middle = [
            ...empty,
            ".....##.....",
            ".....##.....",
            ...empty,
            "............",
        ]
        expect(pixelIconCenteredViewBox(middle)).toBe("0 0 12 12")
        expect(pixelIconCenteredViewBox(["....", "...."])).toBe("0 0 12 12")
    })
})

describe("pixelIconBitmaps", () => {
    it.each(pixelIconNames)("draws %s on the full grid", name => {
        const rows = pixelIconBitmaps[name]
        expect(rows).toHaveLength(PIXEL_ICON_GRID)
        for (const row of rows) {
            expect(row).toMatch(new RegExp(`^[#.]{${String(PIXEL_ICON_GRID)}}$`, "u"))
        }
    })
})

describe("PixelIcon", () => {
    it("hides the icon from assistive technology", () => {
        const { container } = render(<PixelIconSearch />)
        expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
    })

    it("moves the cells of a centered icon to the middle of its box", () => {
        const { container } = render(<PixelIcon name="music" centered={true} />)
        expect(container.querySelector("svg")).toHaveAttribute(
            "viewBox",
            pixelIconCenteredViewBox(pixelIconBitmaps.music),
        )
    })

    it("renders an icon by name", () => {
        const { container } = render(<PixelIcon name="music" />)
        expect(container.querySelector("path")).toHaveAttribute(
            "d",
            pixelIconPath(pixelIconBitmaps.music),
        )
    })
})
