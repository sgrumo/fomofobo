import { userEvent } from "@testing-library/user-event"
import { capitalize, noop } from "es-toolkit"
import { describe, expect, it, vi } from "vitest"
import { z } from "zod"

import { Field } from "../field/field"
import { queryFieldError, submitFieldCallbacksForm } from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { render, screen } from "../test/test-utils"
import { RadioGroup } from "./radio"

/**
 * @remarks Restricts `getByLabelText` to the radio, because the label alone matches more
 */
const radioSelector = { selector: '[role="radio"]' }

const fruitSchema = z.enum(["apple", "banana", "cherry"])
type Fruit = z.infer<typeof fruitSchema>

const fruits: Fruit[] = ["apple", "banana", "cherry"]

describe("RadioGroup", () => {
    it("renders a radio for each item", () => {
        render(
            <RadioGroup
                itemSchema={fruitSchema}
                items={fruits}
                getItemLabel={capitalize}
                value={undefined}
                onValueChange={noop}
            />,
        )

        expect(screen.getAllByRole("radio")).toHaveLength(3)
    })

    it("renders a label for each item", () => {
        render(
            <RadioGroup
                itemSchema={fruitSchema}
                items={fruits}
                getItemLabel={capitalize}
                value={undefined}
                onValueChange={noop}
            />,
        )

        expect(screen.getByLabelText("Apple", radioSelector)).toBeInTheDocument()
        expect(screen.getByLabelText("Banana", radioSelector)).toBeInTheDocument()
        expect(screen.getByLabelText("Cherry", radioSelector)).toBeInTheDocument()
    })

    it("selects the pre-selected item", () => {
        render(
            <RadioGroup
                itemSchema={fruitSchema}
                items={fruits}
                getItemLabel={capitalize}
                value="banana"
                onValueChange={noop}
            />,
        )

        expect(screen.getByLabelText("Apple", radioSelector)).not.toBeChecked()
        expect(screen.getByLabelText("Banana", radioSelector)).toBeChecked()
        expect(screen.getByLabelText("Cherry", radioSelector)).not.toBeChecked()
    })

    it("calls onValueChange when an item is selected", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit) => void>()
        render(
            <RadioGroup
                itemSchema={fruitSchema}
                items={fruits}
                getItemLabel={capitalize}
                value={undefined}
                onValueChange={handleValueChange}
            />,
        )

        await user.click(screen.getByLabelText("Cherry", radioSelector))

        expect(handleValueChange).toHaveBeenCalledWith("cherry")
    })

    it("does not call onValueChange when disabled", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit) => void>()
        render(
            <RadioGroup
                itemSchema={fruitSchema}
                items={fruits}
                getItemLabel={capitalize}
                value={undefined}
                onValueChange={handleValueChange}
                disabled={true}
            />,
        )

        await user.click(screen.getByLabelText("Apple", radioSelector))

        expect(handleValueChange).not.toHaveBeenCalled()
    })

    it("inherits aria-labelledby from Field", () => {
        render(
            <Field required={false} label="Fruits">
                <RadioGroup
                    itemSchema={fruitSchema}
                    items={fruits}
                    getItemLabel={capitalize}
                    value={undefined}
                    onValueChange={noop}
                />
            </Field>,
        )

        const group = screen.getByRole("radiogroup")
        const label = screen.getByText("Fruits")
        expect(group).toHaveAttribute("aria-labelledby", label.id)
    })

    it("inherits disabled from Field", () => {
        render(
            <Field required={false} label="Fruits" disabled={true}>
                <RadioGroup
                    itemSchema={fruitSchema}
                    items={fruits}
                    getItemLabel={capitalize}
                    value={undefined}
                    onValueChange={noop}
                />
            </Field>,
        )

        for (const radio of screen.getAllByRole("radio")) {
            expect(radio).toBeDisabled()
        }
    })
})

describe("RadioGroup field callbacks", () => {
    it("records the change and the blur on the group field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <RadioGroup
                    itemSchema={fruitSchema}
                    items={fruits}
                    getItemLabel={capitalize}
                    value={undefined}
                    onValueChange={noop}
                />
            </FieldCallbacksForm>,
        )

        expect(queryFieldError()).not.toBeInTheDocument()

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        await user.click(screen.getByLabelText("Cherry", radioSelector))
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records nothing when the field callbacks are suppressed", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <RadioGroup
                    itemSchema={fruitSchema}
                    items={fruits}
                    getItemLabel={capitalize}
                    value={undefined}
                    onValueChange={noop}
                    suppressFieldCallbacks={true}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        await user.click(screen.getByLabelText("Cherry", radioSelector))

        expect(queryFieldError()).toBeInTheDocument()
    })
})
