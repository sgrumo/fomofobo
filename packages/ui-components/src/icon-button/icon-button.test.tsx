import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { PixelIconLocate } from "../pixel-icons/pixel-icons"
import { render, screen } from "../test/test-utils"
import { IconButton } from "./icon-button"

describe("IconButton", () => {
    it("is named by its aria-label", () => {
        render(<IconButton aria-label="Locate me" icon={<PixelIconLocate />} />)
        expect(screen.getByRole("button", { name: "Locate me" })).toBeInTheDocument()
    })

    it("calls onClick when clicked", async () => {
        const user = userEvent.setup()
        const onClick = vi.fn<() => void>()
        render(
            <IconButton
                aria-label="Locate me"
                icon={<PixelIconLocate />}
                onClick={onClick}
            />,
        )
        await user.click(screen.getByRole("button", { name: "Locate me" }))
        expect(onClick).toHaveBeenCalledOnce()
    })

    it("requires an aria-label", () => {
        // @ts-expect-error an icon button without an aria-label has no accessible name
        render(<IconButton icon={<PixelIconLocate />} />)
        expect(screen.getByRole("button")).toBeInTheDocument()
    })
})
