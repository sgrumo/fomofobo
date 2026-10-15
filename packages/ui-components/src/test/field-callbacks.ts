import type { userEvent } from "@testing-library/user-event"

import { screen } from "./test-utils"

export const fieldCallbacksLabel = "Field"
export const fieldCallbacksError = "Field error"
export const fieldCallbacksSubmitLabel = "Submit"

type User = ReturnType<typeof userEvent.setup>

/**
 * @remarks Holds the flow for 2 ms, so the next record lands on a later millisecond
 */
const delayRecords = () =>
    new Promise(resolve => {
        setTimeout(resolve, 2)
    })

/**
 * @description Submits the field form, so the field error becomes visible
 * @param user User event instance
 */
export const submitFieldCallbacksForm = async (user: User) => {
    await user.click(screen.getByRole("button", { name: fieldCallbacksSubmitLabel }))
    await delayRecords()
}

/**
 * @description Returns the field error element, or null while the field holds the error back
 */
export const queryFieldError = () => screen.queryByText(fieldCallbacksError)
