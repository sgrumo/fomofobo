import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { render, screen } from "../test/test-utils"
import {
    CollapsibleRoot,
    CollapsibleContent,
    CollapsiblePanel,
    CollapsibleTrigger,
} from "./collapsible"

describe("Collapsible", () => {
    it("renders trigger text", () => {
        render(
            <CollapsibleRoot>
                <CollapsibleTrigger>Toggle</CollapsibleTrigger>
                <CollapsiblePanel>
                    <CollapsibleContent>Content</CollapsibleContent>
                </CollapsiblePanel>
            </CollapsibleRoot>,
        )

        expect(screen.getByRole("button", { name: "Toggle" })).toBeInTheDocument()
    })

    it("expands when trigger is clicked", async () => {
        const user = userEvent.setup()

        render(
            <CollapsibleRoot>
                <CollapsibleTrigger>Toggle</CollapsibleTrigger>
                <CollapsiblePanel>
                    <CollapsibleContent>Hidden content</CollapsibleContent>
                </CollapsiblePanel>
            </CollapsibleRoot>,
        )

        const trigger = screen.getByRole("button", { name: "Toggle" })
        expect(trigger).toHaveAttribute("aria-expanded", "false")

        await user.click(trigger)

        expect(trigger).toHaveAttribute("aria-expanded", "true")
        expect(screen.getByText("Hidden content")).toBeInTheDocument()
    })

    it("collapses when trigger is clicked again", async () => {
        const user = userEvent.setup()

        render(
            <CollapsibleRoot defaultOpen={true}>
                <CollapsibleTrigger>Toggle</CollapsibleTrigger>
                <CollapsiblePanel>
                    <CollapsibleContent>Hidden content</CollapsibleContent>
                </CollapsiblePanel>
            </CollapsibleRoot>,
        )

        const trigger = screen.getByRole("button", { name: "Toggle" })
        expect(trigger).toHaveAttribute("aria-expanded", "true")
        expect(screen.getByText("Hidden content")).toBeInTheDocument()

        await user.click(trigger)

        expect(trigger).toHaveAttribute("aria-expanded", "false")
        expect(screen.queryByText("Hidden content")).not.toBeInTheDocument()
    })

    it("renders with defaultOpen", () => {
        render(
            <CollapsibleRoot defaultOpen={true}>
                <CollapsibleTrigger>Toggle</CollapsibleTrigger>
                <CollapsiblePanel>
                    <CollapsibleContent>Visible immediately</CollapsibleContent>
                </CollapsiblePanel>
            </CollapsibleRoot>,
        )

        expect(screen.getByText("Visible immediately")).toBeInTheDocument()
    })

    it("calls onOpenChange when toggled", async () => {
        const user = userEvent.setup()
        const handleOpenChange = vi.fn<(open: boolean) => void>()

        render(
            <CollapsibleRoot onOpenChange={handleOpenChange}>
                <CollapsibleTrigger>Toggle</CollapsibleTrigger>
                <CollapsiblePanel>
                    <CollapsibleContent>Content</CollapsibleContent>
                </CollapsiblePanel>
            </CollapsibleRoot>,
        )

        await user.click(screen.getByRole("button", { name: "Toggle" }))

        expect(handleOpenChange).toHaveBeenCalledWith(true, expect.anything())

        await user.click(screen.getByRole("button", { name: "Toggle" }))

        expect(handleOpenChange).toHaveBeenCalledWith(false, expect.anything())
    })

    it("supports controlled mode", () => {
        render(
            <CollapsibleRoot open={true}>
                <CollapsibleTrigger>Toggle</CollapsibleTrigger>
                <CollapsiblePanel>
                    <CollapsibleContent>Controlled content</CollapsibleContent>
                </CollapsiblePanel>
            </CollapsibleRoot>,
        )

        expect(screen.getByRole("button", { name: "Toggle" })).toHaveAttribute(
            "aria-expanded",
            "true",
        )
        expect(screen.getByText("Controlled content")).toBeInTheDocument()
    })

    it("applies custom className to all sub-components", async () => {
        const user = userEvent.setup()

        render(
            <CollapsibleRoot data-testid="root" className="custom-root">
                <CollapsibleTrigger className="custom-trigger">Toggle</CollapsibleTrigger>
                <CollapsiblePanel data-testid="panel" className="custom-panel">
                    <CollapsibleContent data-testid="content" className="custom-content">
                        Content
                    </CollapsibleContent>
                </CollapsiblePanel>
            </CollapsibleRoot>,
        )

        expect(screen.getByTestId("root")).toHaveClass("custom-root")
        expect(screen.getByRole("button", { name: "Toggle" })).toHaveClass(
            "custom-trigger",
        )

        await user.click(screen.getByRole("button", { name: "Toggle" }))

        expect(screen.getByTestId("panel")).toHaveClass("custom-panel")
        expect(screen.getByTestId("content")).toHaveClass("custom-content")
    })

    it("respects disabled prop", () => {
        render(
            <CollapsibleRoot disabled={true}>
                <CollapsibleTrigger>Toggle</CollapsibleTrigger>
                <CollapsiblePanel>
                    <CollapsibleContent>Content</CollapsibleContent>
                </CollapsiblePanel>
            </CollapsibleRoot>,
        )

        expect(screen.getByRole("button", { name: "Toggle" })).toHaveAttribute(
            "aria-disabled",
            "true",
        )
    })
})
