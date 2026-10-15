import type { AlertDialogRootChangeEventDetails } from "@base-ui/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { render, screen } from "../test/test-utils"
import { testT as t } from "../test/ui-i18n"
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogClose,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./alert-dialog"

describe("AlertDialog", () => {
    it("opens when trigger is clicked", async () => {
        const user = userEvent.setup()

        render(
            <AlertDialog>
                <AlertDialogTrigger>Open</AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Title</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogBody>Body content</AlertDialogBody>
                </AlertDialogContent>
            </AlertDialog>,
        )

        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Open" }))

        expect(screen.getByRole("alertdialog", { name: "Title" })).toBeInTheDocument()
        expect(screen.getByText("Body content")).toBeInTheDocument()
    })

    it("closes when AlertDialogClose is clicked", async () => {
        const user = userEvent.setup()

        render(
            <AlertDialog defaultOpen={true}>
                <AlertDialogTrigger>Open</AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Title</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogClose>Cancel</AlertDialogClose>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>,
        )

        expect(screen.getByRole("alertdialog", { name: "Title" })).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Cancel" }))

        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    })

    it("calls onOpenChange when opened and closed", async () => {
        const user = userEvent.setup()
        const handleOpenChange =
            vi.fn<
                (open: boolean, eventDetails: AlertDialogRootChangeEventDetails) => void
            >()

        render(
            <AlertDialog onOpenChange={handleOpenChange}>
                <AlertDialogTrigger>Open</AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Title</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogClose>Cancel</AlertDialogClose>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>,
        )

        await user.click(screen.getByRole("button", { name: "Open" }))

        expect(handleOpenChange).toHaveBeenCalledWith(true, expect.anything())

        await user.click(screen.getByRole("button", { name: "Cancel" }))

        expect(handleOpenChange).toHaveBeenCalledWith(false, expect.anything())
    })

    it("renders the description", () => {
        render(
            <AlertDialog defaultOpen={true}>
                <AlertDialogTrigger>Open</AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Title</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        <AlertDialogDescription>
                            Description content
                        </AlertDialogDescription>
                    </AlertDialogBody>
                </AlertDialogContent>
            </AlertDialog>,
        )

        expect(
            screen.getByRole("alertdialog", { description: "Description content" }),
        ).toBeInTheDocument()
        expect(screen.getByText("Description content")).toBeInTheDocument()
    })

    it("closes when header close icon is clicked", async () => {
        const user = userEvent.setup()

        render(
            <AlertDialog defaultOpen={true}>
                <AlertDialogTrigger>Open</AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Title</AlertDialogTitle>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>,
        )

        await user.click(
            screen.getByRole("button", { name: t("Shared.Close", undefined) }),
        )

        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    })

    it("does not close when clicking the backdrop", async () => {
        const user = userEvent.setup()

        render(
            <AlertDialog defaultOpen={true}>
                <AlertDialogTrigger>Open</AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Title</AlertDialogTitle>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>,
        )

        expect(screen.getByRole("alertdialog", { name: "Title" })).toBeInTheDocument()

        const backdrop = document.querySelector<HTMLElement>("[data-open]")
        expect.assert(backdrop)
        await user.click(backdrop)

        expect(screen.getByRole("alertdialog", { name: "Title" })).toBeInTheDocument()
    })
})
