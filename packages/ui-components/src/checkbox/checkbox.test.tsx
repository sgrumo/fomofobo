import { userEvent } from "@testing-library/user-event"
import { capitalize, noop } from "es-toolkit"
import { describe, expect, it, vi } from "vitest"
import { z } from "zod"

import { Field } from "../field/field"
import { queryFieldError, submitFieldCallbacksForm } from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { render, screen } from "../test/test-utils"
import { Checkbox, CheckboxGroup } from "./checkbox"

/**
 * @remarks Restricts `getByLabelText` to the checkbox, because the label alone matches more
 */
const checkboxSelector = { selector: '[role="checkbox"]' }

describe("Checkbox", () => {
    it("renders a checkbox", () => {
        render(<Checkbox value={false} onValueChange={noop} />)

        expect(screen.getByRole("checkbox")).toBeInTheDocument()
    })

    it("is unchecked when value is false", () => {
        render(<Checkbox value={false} onValueChange={noop} />)

        expect(screen.getByRole("checkbox")).not.toBeChecked()
    })

    it("is checked when value is true", () => {
        render(<Checkbox value={true} onValueChange={noop} />)

        expect(screen.getByRole("checkbox")).toBeChecked()
    })

    it("is mixed when value is indeterminate", () => {
        render(<Checkbox value="indeterminate" onValueChange={noop} />)

        expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed")
    })

    it("calls onValueChange with true when checked", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: boolean) => void>()
        render(<Checkbox value={false} onValueChange={handleValueChange} />)

        await user.click(screen.getByRole("checkbox"))

        expect(handleValueChange).toHaveBeenCalledWith(true, expect.anything())
    })

    it("calls onValueChange with false when unchecked", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: boolean) => void>()
        render(<Checkbox value={true} onValueChange={handleValueChange} />)

        await user.click(screen.getByRole("checkbox"))

        expect(handleValueChange).toHaveBeenCalledWith(false, expect.anything())
    })

    it("is disabled when disabled prop is true", () => {
        render(<Checkbox value={false} onValueChange={noop} disabled={true} />)

        expect(screen.getByRole("checkbox")).toBeDisabled()
    })

    it("is required when required prop is true", () => {
        render(<Checkbox value={false} onValueChange={noop} required={true} />)

        expect(screen.getByRole("checkbox")).toBeRequired()
    })

    it("inherits label from Field", () => {
        render(
            <Field required={false} label="Agree">
                <Checkbox value={false} onValueChange={noop} />
            </Field>,
        )

        expect(screen.getByLabelText("Agree", checkboxSelector)).toBeInTheDocument()
    })

    it("inherits disabled from Field", () => {
        render(
            <Field required={false} label="Agree" disabled={true}>
                <Checkbox value={false} onValueChange={noop} />
            </Field>,
        )

        expect(screen.getByRole("checkbox")).toBeDisabled()
    })

    it("inherits required from Field", () => {
        render(
            <Field label="Agree" required={true}>
                <Checkbox value={false} onValueChange={noop} />
            </Field>,
        )

        expect(screen.getByRole("checkbox")).toBeRequired()
    })

    it("prop overrides Field disabled", () => {
        render(
            <Field required={false} label="Agree" disabled={true}>
                <Checkbox value={false} onValueChange={noop} disabled={false} />
            </Field>,
        )

        expect(screen.getByRole("checkbox")).not.toBeDisabled()
    })

    it("prop overrides Field required", () => {
        render(
            <Field label="Agree" required={true}>
                <Checkbox value={false} onValueChange={noop} required={false} />
            </Field>,
        )

        expect(screen.getByRole("checkbox")).not.toBeRequired()
    })
})

const fruitSchema = z.enum(["apple", "banana", "cherry"])
type Fruit = z.infer<typeof fruitSchema>

const fruits: Fruit[] = ["apple", "banana", "cherry"]

describe("CheckboxGroup", () => {
    it("renders a checkbox for each item", () => {
        render(
            <CheckboxGroup
                itemSchema={fruitSchema}
                items={fruits}
                getItemLabel={capitalize}
                value={[]}
                onValueChange={noop}
            />,
        )

        expect(screen.getAllByRole("checkbox")).toHaveLength(3)
    })

    it("renders a label for each item", () => {
        render(
            <CheckboxGroup
                itemSchema={fruitSchema}
                items={fruits}
                getItemLabel={capitalize}
                value={[]}
                onValueChange={noop}
            />,
        )

        expect(screen.getByLabelText("Apple", checkboxSelector)).toBeInTheDocument()
        expect(screen.getByLabelText("Banana", checkboxSelector)).toBeInTheDocument()
        expect(screen.getByLabelText("Cherry", checkboxSelector)).toBeInTheDocument()
    })

    it("checks pre-selected items", () => {
        render(
            <CheckboxGroup
                itemSchema={fruitSchema}
                items={fruits}
                getItemLabel={capitalize}
                value={["apple", "cherry"]}
                onValueChange={noop}
            />,
        )

        expect(screen.getByLabelText("Apple", checkboxSelector)).toBeChecked()
        expect(screen.getByLabelText("Banana", checkboxSelector)).not.toBeChecked()
        expect(screen.getByLabelText("Cherry", checkboxSelector)).toBeChecked()
    })

    it("calls onValueChange when an item is checked", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit[]) => void>()
        render(
            <CheckboxGroup
                itemSchema={fruitSchema}
                items={fruits}
                getItemLabel={capitalize}
                value={[]}
                onValueChange={handleValueChange}
            />,
        )

        await user.click(screen.getByLabelText("Banana", checkboxSelector))

        expect(handleValueChange).toHaveBeenCalledWith(["banana"])
    })

    it("calls onValueChange when an item is unchecked", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit[]) => void>()
        render(
            <CheckboxGroup
                itemSchema={fruitSchema}
                items={fruits}
                getItemLabel={capitalize}
                value={["apple", "banana"]}
                onValueChange={handleValueChange}
            />,
        )

        await user.click(screen.getByLabelText("Apple", checkboxSelector))

        expect(handleValueChange).toHaveBeenCalledWith(["banana"])
    })

    it("inherits aria-labelledby from Field", () => {
        render(
            <Field required={false} label="Fruits">
                <CheckboxGroup
                    itemSchema={fruitSchema}
                    items={fruits}
                    getItemLabel={capitalize}
                    value={[]}
                    onValueChange={noop}
                />
            </Field>,
        )

        const group = screen.getByRole("group")
        const label = screen.getByText("Fruits")
        expect(group).toHaveAttribute("aria-labelledby", label.id)
    })
})

describe("Checkbox field callbacks", () => {
    it("records the change and the blur on the field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Checkbox value={false} onValueChange={noop} />
            </FieldCallbacksForm>,
        )

        expect(queryFieldError()).not.toBeInTheDocument()

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        await user.click(screen.getByRole("checkbox"))
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records nothing when the field callbacks are suppressed", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Checkbox
                    value={false}
                    onValueChange={noop}
                    suppressFieldCallbacks={true}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        await user.click(screen.getByRole("checkbox"))

        expect(queryFieldError()).toBeInTheDocument()
    })
})

describe("CheckboxGroup field callbacks", () => {
    it("records the change and the blur on the group field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <CheckboxGroup
                    itemSchema={fruitSchema}
                    items={fruits}
                    getItemLabel={capitalize}
                    value={[]}
                    onValueChange={noop}
                />
            </FieldCallbacksForm>,
        )

        expect(queryFieldError()).not.toBeInTheDocument()

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        await user.click(screen.getByLabelText("Cherry", checkboxSelector))
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records no blur while the focus stays inside the group", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <CheckboxGroup
                    itemSchema={fruitSchema}
                    items={fruits}
                    getItemLabel={capitalize}
                    value={[]}
                    onValueChange={noop}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        await user.click(screen.getByLabelText("Apple", checkboxSelector))
        await user.click(screen.getByLabelText("Banana", checkboxSelector))

        expect(queryFieldError()).not.toBeInTheDocument()
    })

    it("records nothing when the field callbacks are suppressed", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <CheckboxGroup
                    itemSchema={fruitSchema}
                    items={fruits}
                    getItemLabel={capitalize}
                    value={[]}
                    onValueChange={noop}
                    suppressFieldCallbacks={true}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        await user.click(screen.getByLabelText("Cherry", checkboxSelector))

        expect(queryFieldError()).toBeInTheDocument()
    })
})
