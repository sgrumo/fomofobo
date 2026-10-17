import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DateInput } from "../date-input/date-input"
import { Field } from "../field/field"
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

    it("keeps the sheet open while a custom date input picks a day", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: Date | undefined) => void>()

        render(
            <BottomSheetRoot defaultOpen={true}>
                <BottomSheetContent>
                    <BottomSheetTitle>Choose the dates</BottomSheetTitle>
                    <Field label="From" required={false}>
                        <DateInput
                            mode="custom"
                            value={new Date(2024, 5, 15)}
                            onValueChange={handleChange}
                        />
                    </Field>
                </BottomSheetContent>
            </BottomSheetRoot>,
        )

        await user.click(screen.getByRole("combobox", { name: "From" }))
        await user.click(screen.getByRole("gridcell", { name: "20" }))

        expect(handleChange).toHaveBeenCalledExactlyOnceWith(new Date(2024, 5, 20))
        expect(screen.queryByRole("grid")).not.toBeInTheDocument()
        expect(
            screen.getByRole("dialog", { name: "Choose the dates" }),
        ).toBeInTheDocument()
    })
})
