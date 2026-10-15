import type { PopoverRootChangeEventDetails } from "@base-ui/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { render, screen } from "../test/test-utils"
import { testT as t } from "../test/ui-i18n"
import {
    PopoverRoot,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "./popover"

describe("Popover", () => {
    it("opens when trigger is clicked", async () => {
        const user = userEvent.setup()

        render(
            <PopoverRoot>
                <PopoverTrigger>Open</PopoverTrigger>
                <PopoverContent>
                    <PopoverTitle>Title</PopoverTitle>
                    <PopoverDescription>Description</PopoverDescription>
                </PopoverContent>
            </PopoverRoot>,
        )

        expect(screen.queryByText("Title")).not.toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Open" }))

        expect(screen.getByText("Title")).toBeInTheDocument()
        expect(screen.getByText("Description")).toBeInTheDocument()
    })

    it("closes when clicking trigger again", async () => {
        const user = userEvent.setup()

        render(
            <PopoverRoot>
                <PopoverTrigger>Open</PopoverTrigger>
                <PopoverContent>
                    <PopoverTitle>Title</PopoverTitle>
                </PopoverContent>
            </PopoverRoot>,
        )

        await user.click(screen.getByRole("button", { name: "Open" }))

        expect(screen.getByText("Title")).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Open" }))

        expect(screen.queryByText("Title")).not.toBeInTheDocument()
    })

    it("calls onOpenChange when opened and closed", async () => {
        const user = userEvent.setup()
        const handleOpenChange =
            vi.fn<(open: boolean, eventDetails: PopoverRootChangeEventDetails) => void>()

        render(
            <PopoverRoot onOpenChange={handleOpenChange}>
                <PopoverTrigger>Open</PopoverTrigger>
                <PopoverContent>
                    <PopoverTitle>Title</PopoverTitle>
                </PopoverContent>
            </PopoverRoot>,
        )

        await user.click(screen.getByRole("button", { name: "Open" }))

        expect(handleOpenChange).toHaveBeenCalledWith(true, expect.anything())

        await user.click(screen.getByRole("button", { name: "Open" }))

        expect(handleOpenChange).toHaveBeenCalledWith(false, expect.anything())
    })

    it("closes when header close icon is clicked", async () => {
        const user = userEvent.setup()

        render(
            <PopoverRoot defaultOpen={true}>
                <PopoverTrigger>Open</PopoverTrigger>
                <PopoverContent>
                    <PopoverHeader>
                        <PopoverTitle>Title</PopoverTitle>
                    </PopoverHeader>
                </PopoverContent>
            </PopoverRoot>,
        )

        expect(screen.getByText("Title")).toBeInTheDocument()

        await user.click(
            screen.getByRole("button", { name: t("Shared.Close", undefined) }),
        )

        expect(screen.queryByText("Title")).not.toBeInTheDocument()
    })

    it("renders with defaultOpen", () => {
        render(
            <PopoverRoot defaultOpen={true}>
                <PopoverTrigger>Open</PopoverTrigger>
                <PopoverContent>
                    <PopoverTitle>Title</PopoverTitle>
                    <PopoverDescription>Visible immediately</PopoverDescription>
                </PopoverContent>
            </PopoverRoot>,
        )

        expect(screen.getByText("Visible immediately")).toBeInTheDocument()
    })
})
