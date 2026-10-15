import type { DrawerRootChangeEventDetails } from "@base-ui/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { render, screen } from "../test/test-utils"
import { testT as t } from "../test/ui-i18n"
import {
    DrawerRoot,
    DrawerBody,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "./drawer"

describe("Drawer", () => {
    it("opens when trigger is clicked", async () => {
        const user = userEvent.setup()

        render(
            <DrawerRoot side="right">
                <DrawerTrigger>Open</DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Title</DrawerTitle>
                    </DrawerHeader>
                    <DrawerBody>Body content</DrawerBody>
                </DrawerContent>
            </DrawerRoot>,
        )

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Open" }))

        expect(screen.getByRole("dialog", { name: "Title" })).toBeInTheDocument()
        expect(screen.getByText("Body content")).toBeInTheDocument()
    })

    it("closes when DrawerClose is clicked", async () => {
        const user = userEvent.setup()

        render(
            <DrawerRoot side="right" defaultOpen={true}>
                <DrawerTrigger>Open</DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Title</DrawerTitle>
                    </DrawerHeader>
                    <DrawerClose>Cancel</DrawerClose>
                </DrawerContent>
            </DrawerRoot>,
        )

        expect(screen.getByRole("dialog", { name: "Title" })).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Cancel" }))

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("calls onOpenChange when opened and closed", async () => {
        const user = userEvent.setup()
        const handleOpenChange =
            vi.fn<(open: boolean, eventDetails: DrawerRootChangeEventDetails) => void>()

        render(
            <DrawerRoot side="right" onOpenChange={handleOpenChange}>
                <DrawerTrigger>Open</DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Title</DrawerTitle>
                    </DrawerHeader>
                    <DrawerClose>Cancel</DrawerClose>
                </DrawerContent>
            </DrawerRoot>,
        )

        await user.click(screen.getByRole("button", { name: "Open" }))

        expect(handleOpenChange).toHaveBeenCalledWith(true, expect.anything())

        await user.click(screen.getByRole("button", { name: "Cancel" }))

        expect(handleOpenChange).toHaveBeenCalledWith(false, expect.anything())
    })

    it("closes when header close icon is clicked", async () => {
        const user = userEvent.setup()

        render(
            <DrawerRoot side="right" defaultOpen={true}>
                <DrawerTrigger>Open</DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Title</DrawerTitle>
                    </DrawerHeader>
                </DrawerContent>
            </DrawerRoot>,
        )

        await user.click(
            screen.getByRole("button", { name: t("Shared.Close", undefined) }),
        )

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("renders description text", async () => {
        const user = userEvent.setup()

        render(
            <DrawerRoot side="right">
                <DrawerTrigger>Open</DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Title</DrawerTitle>
                        <DrawerDescription>Drawer description</DrawerDescription>
                    </DrawerHeader>
                    <DrawerBody>Body</DrawerBody>
                </DrawerContent>
            </DrawerRoot>,
        )

        await user.click(screen.getByRole("button", { name: "Open" }))

        expect(screen.getByText("Drawer description")).toBeInTheDocument()
    })

    it("hides handle when showHandle is false", async () => {
        const user = userEvent.setup()
        const handleClassName = "mx-auto"

        render(
            <DrawerRoot side="right" showHandle={false}>
                <DrawerTrigger>Open</DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Title</DrawerTitle>
                    </DrawerHeader>
                </DrawerContent>
            </DrawerRoot>,
        )

        await user.click(screen.getByRole("button", { name: "Open" }))

        const dialog = screen.getByRole("dialog")
        expect(dialog.querySelector(`.${handleClassName}`)).not.toBeInTheDocument()
    })
})
