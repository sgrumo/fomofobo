import { userEvent } from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { render, screen } from "../test/test-utils"
import { Chip, ChipBar, ChipRow } from "./chip"

const ControlledChip = () => {
    const [pressed, setPressed] = useState(false)
    return (
        <Chip label="Music" count={12} pressed={pressed} onPressedChange={setPressed} />
    )
}

describe("Chip", () => {
    it("joins the label and the count in its accessible name", () => {
        render(<Chip label="Music" count={12} />)
        expect(screen.getByRole("button", { name: "Music 12" })).toBeInTheDocument()
    })

    it("toggles the pressed state on click", async () => {
        const user = userEvent.setup()
        render(<ControlledChip />)
        const chip = screen.getByRole("button", { name: "Music 12" })
        expect(chip).toHaveAttribute("aria-pressed", "false")
        await user.click(chip)
        expect(chip).toHaveAttribute("aria-pressed", "true")
    })
})

describe("ChipRow", () => {
    it("groups the chips under its label", () => {
        render(
            <ChipRow label="Categories">
                <Chip label="Music" />
            </ChipRow>,
        )
        expect(screen.getByRole("group", { name: "Categories" })).toContainElement(
            screen.getByRole("button", { name: "Music" }),
        )
    })
})

describe("ChipBar", () => {
    it("groups its chips under its own label, inside a row", () => {
        render(
            <ChipRow label="Dates and price">
                <ChipBar label="Dates">
                    <Chip label="Today" />
                </ChipBar>
                <Chip label="Free" />
            </ChipRow>,
        )
        const bar = screen.getByRole("group", { name: "Dates" })
        expect(bar).toContainElement(screen.getByRole("button", { name: "Today" }))
        expect(bar).not.toContainElement(screen.getByRole("button", { name: "Free" }))
    })
})
