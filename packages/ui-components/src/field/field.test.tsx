import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import { describe, expect, it } from "vitest"

import { Form } from "../form/form"
import { StringInput } from "../string-input/string-input"
import { render, screen } from "../test/test-utils"
import { Field } from "./field"

const errorMessage = "Invalid username"

interface RenderFieldProps {
    mode?: "edit" | "view"
    description?: string
    errors?: string[]
}
/**
 * @description Renders a field with an error inside a submittable form
 * @param props Field overrides
 */
const renderField = (props: RenderFieldProps = {}) =>
    render(
        <Form mode={props.mode ?? "edit"} onSubmit={noop} noValidate={false}>
            <Field
                label="Username"
                required={false}
                errors={props.errors ?? [errorMessage]}
                description={props.description}
            >
                <StringInput value={undefined} onValueChange={noop} />
            </Field>
            <button type="submit">Submit</button>
        </Form>,
    )

describe("Field", () => {
    it("renders no error before the first submission", () => {
        renderField()

        expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
    })

    it("renders no error outside a form", () => {
        render(
            <Field label="Username" required={false} errors={[errorMessage]}>
                <StringInput value={undefined} onValueChange={noop} />
            </Field>,
        )

        expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
    })

    it("renders no error in view mode", async () => {
        const user = userEvent.setup()
        renderField({ mode: "view" })

        await user.click(screen.getByRole("button", { name: "Submit" }))

        expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
    })

    it("renders the error after the submission", async () => {
        const user = userEvent.setup()
        renderField()

        await user.click(screen.getByRole("button", { name: "Submit" }))

        expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it("hides the error while the user changes the field", async () => {
        const user = userEvent.setup()
        renderField()

        await user.click(screen.getByRole("button", { name: "Submit" }))
        await user.type(screen.getByLabelText("Username"), "a")

        expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
    })

    it("renders the error again after the user leaves the field", async () => {
        const user = userEvent.setup()
        renderField()

        await user.click(screen.getByRole("button", { name: "Submit" }))
        await user.type(screen.getByLabelText("Username"), "a")
        await user.tab()

        expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it("renders no error list for an empty errors array", async () => {
        const user = userEvent.setup()
        renderField({ errors: [] })

        await user.click(screen.getByRole("button", { name: "Submit" }))

        expect(screen.queryByRole("list")).not.toBeInTheDocument()
        expect(screen.getByLabelText("Username")).not.toHaveAttribute("aria-describedby")
    })

    it("renders every error stacked in one list", async () => {
        const user = userEvent.setup()
        renderField({ errors: [errorMessage, "Too short"] })

        await user.click(screen.getByRole("button", { name: "Submit" }))

        const items = screen.getAllByRole("listitem")
        expect(items.map(item => item.textContent)).toStrictEqual([
            errorMessage,
            "Too short",
        ])
        expect(screen.getByLabelText("Username")).toHaveAccessibleDescription(
            `${errorMessage} Too short`,
        )
    })

    it("describes the input with the visible error", async () => {
        const user = userEvent.setup()
        renderField({ description: "Your public handle" })

        expect(screen.getByLabelText("Username")).toHaveAccessibleDescription(
            "Your public handle",
        )

        await user.click(screen.getByRole("button", { name: "Submit" }))

        expect(screen.getByLabelText("Username")).toHaveAccessibleDescription(
            `Your public handle ${errorMessage}`,
        )
    })
})
