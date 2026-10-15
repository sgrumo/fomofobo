import type { DialogRootChangeEventDetails } from "@base-ui/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { render, screen } from "../test/test-utils"
import { testT as t } from "../test/ui-i18n"
import {
    DialogRoot,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./dialog"

describe("Dialog", () => {
    it("opens when trigger is clicked", async () => {
        const user = userEvent.setup()

        render(
            <DialogRoot>
                <DialogTrigger>Open</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Title</DialogTitle>
                    </DialogHeader>
                    <DialogBody>Body content</DialogBody>
                </DialogContent>
            </DialogRoot>,
        )

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Open" }))

        expect(screen.getByRole("dialog", { name: "Title" })).toBeInTheDocument()
        expect(screen.getByText("Body content")).toBeInTheDocument()
    })

    it("closes when DialogClose is clicked", async () => {
        const user = userEvent.setup()

        render(
            <DialogRoot defaultOpen={true}>
                <DialogTrigger>Open</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Title</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose>Cancel</DialogClose>
                    </DialogFooter>
                </DialogContent>
            </DialogRoot>,
        )

        expect(screen.getByRole("dialog", { name: "Title" })).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Cancel" }))

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("calls onOpenChange when opened and closed", async () => {
        const user = userEvent.setup()
        const handleOpenChange =
            vi.fn<(open: boolean, eventDetails: DialogRootChangeEventDetails) => void>()

        render(
            <DialogRoot onOpenChange={handleOpenChange}>
                <DialogTrigger>Open</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Title</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose>Cancel</DialogClose>
                    </DialogFooter>
                </DialogContent>
            </DialogRoot>,
        )

        await user.click(screen.getByRole("button", { name: "Open" }))

        expect(handleOpenChange).toHaveBeenCalledWith(true, expect.anything())

        await user.click(screen.getByRole("button", { name: "Cancel" }))

        expect(handleOpenChange).toHaveBeenCalledWith(false, expect.anything())
    })

    it("renders the description", () => {
        render(
            <DialogRoot defaultOpen={true}>
                <DialogTrigger>Open</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Title</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <DialogDescription>Description content</DialogDescription>
                    </DialogBody>
                </DialogContent>
            </DialogRoot>,
        )

        expect(
            screen.getByRole("dialog", { description: "Description content" }),
        ).toBeInTheDocument()
        expect(screen.getByText("Description content")).toBeInTheDocument()
    })

    it("closes when header close icon is clicked", async () => {
        const user = userEvent.setup()

        render(
            <DialogRoot defaultOpen={true}>
                <DialogTrigger>Open</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Title</DialogTitle>
                    </DialogHeader>
                </DialogContent>
            </DialogRoot>,
        )

        await user.click(
            screen.getByRole("button", { name: t("Shared.Close", undefined) }),
        )

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
})
