import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { render, screen, waitFor } from "../test/test-utils"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuGroupLabel,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "./context-menu"

const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })

const rightClick = async (user: ReturnType<typeof userEvent.setup>, target: Element) => {
    await user.pointer({ target, keys: "[MouseRight]" })
}

describe("ContextMenu", () => {
    it("opens on right-click", async () => {
        const user = setupUser()

        render(
            <ContextMenu>
                <ContextMenuTrigger>Right-click here</ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem>Action 1</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>,
        )

        expect(
            screen.queryByRole("menuitem", { name: "Action 1" }),
        ).not.toBeInTheDocument()

        await rightClick(user, screen.getByText("Right-click here"))

        await waitFor(() => {
            expect(screen.getByRole("menuitem", { name: "Action 1" })).toBeInTheDocument()
        })
    })

    it("closes when an item is clicked", async () => {
        const user = setupUser()

        render(
            <ContextMenu>
                <ContextMenuTrigger>Right-click here</ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem>Action 1</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>,
        )

        await rightClick(user, screen.getByText("Right-click here"))

        await waitFor(() => {
            expect(screen.getByRole("menuitem", { name: "Action 1" })).toBeInTheDocument()
        })

        await user.click(screen.getByRole("menuitem", { name: "Action 1" }))

        await waitFor(() => {
            expect(
                screen.queryByRole("menuitem", { name: "Action 1" }),
            ).not.toBeInTheDocument()
        })
    })

    it("calls onClick on context menu item", async () => {
        const user = setupUser()
        const handleClick = vi.fn<() => void>()

        render(
            <ContextMenu>
                <ContextMenuTrigger>Right-click here</ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onClick={handleClick}>Action</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>,
        )

        await rightClick(user, screen.getByText("Right-click here"))

        await waitFor(() => {
            expect(screen.getByRole("menuitem", { name: "Action" })).toBeInTheDocument()
        })

        await user.click(screen.getByRole("menuitem", { name: "Action" }))

        expect(handleClick).toHaveBeenCalledOnce()
    })

    it("renders groups with labels and separators", async () => {
        const user = setupUser()

        render(
            <ContextMenu>
                <ContextMenuTrigger>Right-click here</ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuGroup>
                        <ContextMenuGroupLabel>Edit</ContextMenuGroupLabel>
                        <ContextMenuItem>Cut</ContextMenuItem>
                        <ContextMenuItem>Copy</ContextMenuItem>
                    </ContextMenuGroup>
                    <ContextMenuSeparator />
                    <ContextMenuGroup>
                        <ContextMenuGroupLabel>Danger</ContextMenuGroupLabel>
                        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
                    </ContextMenuGroup>
                </ContextMenuContent>
            </ContextMenu>,
        )

        await rightClick(user, screen.getByText("Right-click here"))

        await waitFor(() => {
            expect(screen.getByText("Edit")).toBeInTheDocument()
            expect(screen.getByText("Danger")).toBeInTheDocument()
            expect(screen.getByRole("menuitem", { name: "Cut" })).toBeInTheDocument()
            expect(screen.getByRole("menuitem", { name: "Copy" })).toBeInTheDocument()
            expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument()
        })
    })

    it("supports destructive variant on items", async () => {
        const user = setupUser()

        render(
            <ContextMenu>
                <ContextMenuTrigger>Right-click here</ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem variant="destructive" data-testid="destructive">
                        Delete
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>,
        )

        await rightClick(user, screen.getByText("Right-click here"))

        await waitFor(() => {
            expect(screen.getByTestId("destructive")).toBeInTheDocument()
        })
    })
})
