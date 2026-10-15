import { userEvent } from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { render, screen } from "../test/test-utils"
import { testT as t } from "../test/ui-i18n"
import { SearchField } from "./search-field"

const ControlledSearchField = () => {
    const [value, setValue] = useState("")
    return (
        <SearchField
            label="Search events"
            placeholder="Event, place, date"
            value={value}
            onValueChange={setValue}
        />
    )
}

describe("SearchField", () => {
    it("is a searchbox named by its label, with the placeholder", () => {
        render(<ControlledSearchField />)
        expect(screen.getByRole("searchbox", { name: "Search events" })).toHaveAttribute(
            "placeholder",
            "Event, place, date",
        )
    })

    it("shows the clear button only with a value, and clears on click", async () => {
        const user = userEvent.setup()
        render(<ControlledSearchField />)
        const input = screen.getByRole("searchbox", { name: "Search events" })
        expect(
            screen.queryByRole("button", { name: t("SearchField.Clear", undefined) }),
        ).not.toBeInTheDocument()

        await user.type(input, "jazz")
        expect(input).toHaveValue("jazz")

        await user.click(
            screen.getByRole("button", { name: t("SearchField.Clear", undefined) }),
        )
        expect(input).toHaveValue("")
        expect(input).toHaveFocus()
    })
})
