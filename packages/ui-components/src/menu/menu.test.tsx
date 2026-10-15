import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { render, screen, waitFor } from "../test/test-utils"
import {
    MenuRoot,
    MenuContent,
    MenuGroup,
    MenuGroupLabel,
    MenuItem,
    MenuSeparator,
    MenuTrigger,
} from "./menu"

const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })

describe("Menu", () => {
    it("renders trigger with menu haspopup", () => {
        render(
            <MenuRoot>
                <MenuTrigger>Open</MenuTrigger>
                <MenuContent>
                    <MenuItem>Item 1</MenuItem>
                </MenuContent>
            </MenuRoot>,
        )

        expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
            "aria-haspopup",
            "menu",
        )
    })

    it("opens when trigger is clicked", async () => {
        const user = setupUser()

        render(
            <MenuRoot>
                <MenuTrigger>Open</MenuTrigger>
                <MenuContent>
                    <MenuItem>Item 1</MenuItem>
                    <MenuItem>Item 2</MenuItem>
                </MenuContent>
            </MenuRoot>,
        )

        await user.click(screen.getByRole("button", { name: "Open" }))

        await waitFor(() => {
            expect(screen.getByRole("menuitem", { name: "Item 1" })).toBeInTheDocument()
            expect(screen.getByRole("menuitem", { name: "Item 2" })).toBeInTheDocument()
        })
    })

    it("closes when an item is clicked", async () => {
        const user = setupUser()

        render(
            <MenuRoot>
                <MenuTrigger>Open</MenuTrigger>
                <MenuContent>
                    <MenuItem>Item 1</MenuItem>
                </MenuContent>
            </MenuRoot>,
        )

        await user.click(screen.getByRole("button", { name: "Open" }))

        await waitFor(() => {
            expect(screen.getByRole("menuitem", { name: "Item 1" })).toBeInTheDocument()
        })

        await user.click(screen.getByRole("menuitem", { name: "Item 1" }))

        await waitFor(() => {
            expect(
                screen.queryByRole("menuitem", { name: "Item 1" }),
            ).not.toBeInTheDocument()
        })
    })

    it("calls onClick on menu item", async () => {
        const user = setupUser()
        const handleClick = vi.fn<() => void>()

        render(
            <MenuRoot>
                <MenuTrigger>Open</MenuTrigger>
                <MenuContent>
                    <MenuItem onClick={handleClick}>Action</MenuItem>
                </MenuContent>
            </MenuRoot>,
        )

        await user.click(screen.getByRole("button", { name: "Open" }))

        await waitFor(() => {
            expect(screen.getByRole("menuitem", { name: "Action" })).toBeInTheDocument()
        })

        await user.click(screen.getByRole("menuitem", { name: "Action" }))

        expect(handleClick).toHaveBeenCalledOnce()
    })

    it("renders groups with labels", async () => {
        const user = setupUser()

        render(
            <MenuRoot>
                <MenuTrigger>Open</MenuTrigger>
                <MenuContent>
                    <MenuGroup>
                        <MenuGroupLabel>Group 1</MenuGroupLabel>
                        <MenuItem>Item A</MenuItem>
                    </MenuGroup>
                    <MenuSeparator />
                    <MenuGroup>
                        <MenuGroupLabel>Group 2</MenuGroupLabel>
                        <MenuItem>Item B</MenuItem>
                    </MenuGroup>
                </MenuContent>
            </MenuRoot>,
        )

        await user.click(screen.getByRole("button", { name: "Open" }))

        await waitFor(() => {
            expect(screen.getByText("Group 1")).toBeInTheDocument()
            expect(screen.getByText("Group 2")).toBeInTheDocument()
            expect(screen.getByRole("menuitem", { name: "Item A" })).toBeInTheDocument()
            expect(screen.getByRole("menuitem", { name: "Item B" })).toBeInTheDocument()
        })
    })

    it("supports destructive variant on items", async () => {
        const user = setupUser()

        render(
            <MenuRoot>
                <MenuTrigger>Open</MenuTrigger>
                <MenuContent>
                    <MenuItem variant="destructive" data-testid="destructive">
                        Delete
                    </MenuItem>
                </MenuContent>
            </MenuRoot>,
        )

        await user.click(screen.getByRole("button", { name: "Open" }))

        await waitFor(() => {
            expect(screen.getByTestId("destructive")).toBeInTheDocument()
        })
    })

    it("applies custom className to content", async () => {
        const user = setupUser()

        render(
            <MenuRoot>
                <MenuTrigger>Open</MenuTrigger>
                <MenuContent data-testid="popup" className="custom-popup">
                    <MenuItem>Item</MenuItem>
                </MenuContent>
            </MenuRoot>,
        )

        await user.click(screen.getByRole("button", { name: "Open" }))

        await waitFor(() => {
            expect(screen.getByTestId("popup")).toHaveClass("custom-popup")
        })
    })
})
