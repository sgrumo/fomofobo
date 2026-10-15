import { userEvent } from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { render, screen } from "../test/test-utils"
import {
    BottomSheetClose,
    BottomSheetContent,
    BottomSheetRoot,
    BottomSheetTitle,
    BottomSheetTrigger,
} from "./bottom-sheet"

describe("BottomSheet", () => {
    it("opens on the trigger and closes on the close button", async () => {
        const user = userEvent.setup()

        render(
            <BottomSheetRoot>
                <BottomSheetTrigger>Open preview</BottomSheetTrigger>
                <BottomSheetContent>
                    <BottomSheetTitle>Jazz at the cloister</BottomSheetTitle>
                    <BottomSheetClose>Done</BottomSheetClose>
                </BottomSheetContent>
            </BottomSheetRoot>,
        )

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        await user.click(screen.getByRole("button", { name: "Open preview" }))
        expect(
            screen.getByRole("dialog", { name: "Jazz at the cloister" }),
        ).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Done" }))
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
})
