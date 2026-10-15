import { userEvent } from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { render, screen, waitFor } from "../test/test-utils"
import { Tooltip } from "./tooltip"

describe("Tooltip", () => {
    it("renders children directly when active is false", () => {
        render(
            <Tooltip active={false} content="Tooltip text">
                <span>Hover me</span>
            </Tooltip>,
        )

        expect(screen.getByText("Hover me")).toBeInTheDocument()
        expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument()
    })

    it("renders trigger when active is true", () => {
        render(
            <Tooltip active={true} content="Tooltip text">
                <span>Hover me</span>
            </Tooltip>,
        )

        expect(screen.getByText("Hover me")).toBeInTheDocument()
        expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument()
    })

    it("shows tooltip content on hover", async () => {
        const user = userEvent.setup()

        render(
            <Tooltip active={true} content="Tooltip text">
                <span>Hover me</span>
            </Tooltip>,
        )

        await user.hover(screen.getByText("Hover me"))

        expect(await screen.findByText("Tooltip text")).toBeInTheDocument()
    })

    it("hides tooltip content on unhover", async () => {
        const user = userEvent.setup()

        render(
            <Tooltip active={true} content="Tooltip text">
                <span>Hover me</span>
            </Tooltip>,
        )

        await user.hover(screen.getByText("Hover me"))
        expect(await screen.findByText("Tooltip text")).toBeInTheDocument()

        await user.unhover(screen.getByText("Hover me"))

        await waitFor(() => {
            expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument()
        })
    })

    it("renders rich content in tooltip", async () => {
        const user = userEvent.setup()

        render(
            <Tooltip
                active={true}
                content={<span data-testid="rich-content">Rich tooltip</span>}
            >
                <span>Hover me</span>
            </Tooltip>,
        )

        await user.hover(screen.getByText("Hover me"))

        expect(await screen.findByTestId("rich-content")).toBeInTheDocument()
        expect(screen.getByText("Rich tooltip")).toBeInTheDocument()
    })

    it("does not show tooltip when active is false even on hover", async () => {
        const user = userEvent.setup()

        render(
            <Tooltip active={false} content="Tooltip text">
                <span>Hover me</span>
            </Tooltip>,
        )

        await user.hover(screen.getByText("Hover me"))

        expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument()
    })

    it("supports defaultOpen to show tooltip immediately", async () => {
        render(
            <Tooltip active={true} content="Tooltip text" defaultOpen={true}>
                <span>Hover me</span>
            </Tooltip>,
        )

        expect(await screen.findByText("Tooltip text")).toBeInTheDocument()
    })
})
