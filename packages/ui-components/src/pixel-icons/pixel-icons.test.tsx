import {
    pixelIconBitmaps,
    pixelIconCenteredViewBox,
    pixelIconPath,
} from "domain/pixel-icons"
import { describe, expect, it } from "vitest"

import { render } from "../test/test-utils"
import { PixelIcon, PixelIconSearch } from "./pixel-icons"

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
