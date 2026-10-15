import type { AccordionRootChangeEventDetails } from "@base-ui/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { render, screen } from "../test/test-utils"
import {
    AccordionRoot,
    AccordionContent,
    AccordionItem,
    AccordionPanel,
    AccordionTrigger,
} from "./accordion"

describe("Accordion", () => {
    it("renders accordion with items", () => {
        render(
            <AccordionRoot>
                <AccordionItem value="item-1">
                    <AccordionTrigger>Section 1</AccordionTrigger>
                    <AccordionPanel>
                        <AccordionContent>Content 1</AccordionContent>
                    </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Section 2</AccordionTrigger>
                    <AccordionPanel>
                        <AccordionContent>Content 2</AccordionContent>
                    </AccordionPanel>
                </AccordionItem>
            </AccordionRoot>,
        )

        expect(screen.getByRole("button", { name: "Section 1" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Section 2" })).toBeInTheDocument()
    })

    it("expands item when trigger is clicked", async () => {
        const user = userEvent.setup()

        render(
            <AccordionRoot>
                <AccordionItem value="item-1">
                    <AccordionTrigger>Section 1</AccordionTrigger>
                    <AccordionPanel>
                        <AccordionContent>Content 1</AccordionContent>
                    </AccordionPanel>
                </AccordionItem>
            </AccordionRoot>,
        )

        const trigger = screen.getByRole("button", { name: "Section 1" })
        expect(trigger).toHaveAttribute("aria-expanded", "false")

        await user.click(trigger)

        expect(trigger).toHaveAttribute("aria-expanded", "true")
        expect(screen.getByText("Content 1")).toBeInTheDocument()
    })

    it("collapses item when trigger is clicked again", async () => {
        const user = userEvent.setup()

        render(
            <AccordionRoot defaultValue={["item-1"]}>
                <AccordionItem value="item-1">
                    <AccordionTrigger>Section 1</AccordionTrigger>
                    <AccordionPanel>
                        <AccordionContent>Content 1</AccordionContent>
                    </AccordionPanel>
                </AccordionItem>
            </AccordionRoot>,
        )

        const trigger = screen.getByRole("button", { name: "Section 1" })
        expect(trigger).toHaveAttribute("aria-expanded", "true")
        expect(screen.getByText("Content 1")).toBeInTheDocument()

        await user.click(trigger)

        expect(trigger).toHaveAttribute("aria-expanded", "false")
        expect(screen.queryByText("Content 1")).not.toBeInTheDocument()
    })

    /**
     * @description Renders an accordion holding two collapsed items
     */
    const renderTwoItemAccordion = () =>
        render(
            <AccordionRoot>
                <AccordionItem value="item-1">
                    <AccordionTrigger>Section 1</AccordionTrigger>
                    <AccordionPanel>
                        <AccordionContent>Content 1</AccordionContent>
                    </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Section 2</AccordionTrigger>
                    <AccordionPanel>
                        <AccordionContent>Content 2</AccordionContent>
                    </AccordionPanel>
                </AccordionItem>
            </AccordionRoot>,
        )

    it("expands the clicked item (single-select)", async () => {
        const user = userEvent.setup()
        renderTwoItemAccordion()

        const trigger1 = screen.getByRole("button", { name: "Section 1" })
        const trigger2 = screen.getByRole("button", { name: "Section 2" })

        await user.click(trigger1)

        expect(trigger1).toHaveAttribute("aria-expanded", "true")
        expect(trigger2).toHaveAttribute("aria-expanded", "false")
        expect(screen.getByText("Content 1")).toBeInTheDocument()
        expect(screen.queryByText("Content 2")).not.toBeInTheDocument()
    })

    it("closes the previously expanded item when another is clicked (single-select)", async () => {
        const user = userEvent.setup()
        renderTwoItemAccordion()

        const trigger1 = screen.getByRole("button", { name: "Section 1" })
        const trigger2 = screen.getByRole("button", { name: "Section 2" })

        await user.click(trigger1)
        await user.click(trigger2)

        expect(trigger1).toHaveAttribute("aria-expanded", "false")
        expect(trigger2).toHaveAttribute("aria-expanded", "true")
        expect(screen.queryByText("Content 1")).not.toBeInTheDocument()
        expect(screen.getByText("Content 2")).toBeInTheDocument()
    })

    it("renders with controlled value", () => {
        render(
            <AccordionRoot value={["item-2"]}>
                <AccordionItem value="item-1">
                    <AccordionTrigger>Section 1</AccordionTrigger>
                    <AccordionPanel>
                        <AccordionContent>Content 1</AccordionContent>
                    </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Section 2</AccordionTrigger>
                    <AccordionPanel>
                        <AccordionContent>Content 2</AccordionContent>
                    </AccordionPanel>
                </AccordionItem>
            </AccordionRoot>,
        )

        expect(screen.getByRole("button", { name: "Section 1" })).toHaveAttribute(
            "aria-expanded",
            "false",
        )
        expect(screen.getByRole("button", { name: "Section 2" })).toHaveAttribute(
            "aria-expanded",
            "true",
        )
        expect(screen.queryByText("Content 1")).not.toBeInTheDocument()
        expect(screen.getByText("Content 2")).toBeInTheDocument()
    })

    it("calls onValueChange when item is toggled", async () => {
        const user = userEvent.setup()
        const handleValueChange =
            vi.fn<
                (value: string[], eventDetails: AccordionRootChangeEventDetails) => void
            >()

        render(
            <AccordionRoot onValueChange={handleValueChange}>
                <AccordionItem value="item-1">
                    <AccordionTrigger>Section 1</AccordionTrigger>
                    <AccordionPanel>
                        <AccordionContent>Content 1</AccordionContent>
                    </AccordionPanel>
                </AccordionItem>
            </AccordionRoot>,
        )

        await user.click(screen.getByRole("button", { name: "Section 1" }))

        expect(handleValueChange).toHaveBeenCalledOnce()
        expect(handleValueChange.mock.calls[0]?.[0]).toStrictEqual(["item-1"])
    })

    it("applies custom className to all sub-components", async () => {
        const user = userEvent.setup()

        render(
            <AccordionRoot data-testid="accordion" className="custom-accordion">
                <AccordionItem value="item-1" data-testid="item" className="custom-item">
                    <AccordionTrigger className="custom-trigger">
                        Section 1
                    </AccordionTrigger>
                    <AccordionPanel data-testid="panel" className="custom-panel">
                        <AccordionContent
                            data-testid="content"
                            className="custom-content"
                        >
                            Content 1
                        </AccordionContent>
                    </AccordionPanel>
                </AccordionItem>
            </AccordionRoot>,
        )

        expect(screen.getByTestId("accordion")).toHaveClass("custom-accordion")
        expect(screen.getByTestId("item")).toHaveClass("custom-item")
        expect(screen.getByRole("button", { name: "Section 1" })).toHaveClass(
            "custom-trigger",
        )

        await user.click(screen.getByRole("button", { name: "Section 1" }))

        expect(screen.getByTestId("panel")).toHaveClass("custom-panel")
        expect(screen.getByTestId("content")).toHaveClass("custom-content")
    })

    /**
     * @description Renders an accordion holding three items, with the first two expanded
     */
    const renderThreeItemAccordionWithDefault = () =>
        render(
            <AccordionRoot defaultValue={["item-1", "item-2"]}>
                <AccordionItem value="item-1">
                    <AccordionTrigger>Section 1</AccordionTrigger>
                    <AccordionPanel>
                        <AccordionContent>Content 1</AccordionContent>
                    </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Section 2</AccordionTrigger>
                    <AccordionPanel>
                        <AccordionContent>Content 2</AccordionContent>
                    </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>Section 3</AccordionTrigger>
                    <AccordionPanel>
                        <AccordionContent>Content 3</AccordionContent>
                    </AccordionPanel>
                </AccordionItem>
            </AccordionRoot>,
        )

    it("expands items listed in defaultValue", () => {
        renderThreeItemAccordionWithDefault()

        expect(screen.getByRole("button", { name: "Section 1" })).toHaveAttribute(
            "aria-expanded",
            "true",
        )
        expect(screen.getByRole("button", { name: "Section 2" })).toHaveAttribute(
            "aria-expanded",
            "true",
        )
        expect(screen.getByText("Content 1")).toBeInTheDocument()
        expect(screen.getByText("Content 2")).toBeInTheDocument()
    })

    it("leaves items not in defaultValue collapsed", () => {
        renderThreeItemAccordionWithDefault()

        expect(screen.getByRole("button", { name: "Section 3" })).toHaveAttribute(
            "aria-expanded",
            "false",
        )
        expect(screen.queryByText("Content 3")).not.toBeInTheDocument()
    })
})
