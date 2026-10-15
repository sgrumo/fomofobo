import { describe, expect, it } from "vitest"

import { render } from "../test/test-utils"
import { PixelIcon, PixelIconSearch } from "./pixel-icons"
import {
    PIXEL_ICON_GRID,
    pixelIconBitmaps,
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

    it("renders an icon by name", () => {
        const { container } = render(<PixelIcon name="music" />)
        expect(container.querySelector("path")).toHaveAttribute(
            "d",
            pixelIconPath(pixelIconBitmaps.music),
        )
    })
})
