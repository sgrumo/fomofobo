import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import { describe, expect, it, vi } from "vitest"

import { Field } from "../field/field"
import { queryFieldError, submitFieldCallbacksForm } from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { render, screen } from "../test/test-utils"
import { NumberInput } from "./number-input"

/**
 * @description Returns the decrement and increment control buttons
 * @throws When the render holds fewer than two buttons
 */
const getControlButtons = () => {
    const [decrement, increment] = screen.getAllByRole("button")
    if (!decrement || !increment) {
        throw new Error("Expected two control buttons")
    }
    return { decrement, increment }
}

describe("NumberInput", () => {
    it("renders with value", () => {
        render(
            <NumberInput
                size="md"
                value={42}
                onValueChange={vi.fn<(value: number | undefined) => void>()}
            />,
        )

        expect(screen.getByRole("textbox")).toHaveValue("42")
    })

    it("renders empty when value is undefined", () => {
        render(
            <NumberInput
                size="md"
                value={undefined}
                onValueChange={vi.fn<(value: number | undefined) => void>()}
            />,
        )

        expect(screen.getByRole("textbox")).toHaveValue("")
    })

    it("calls onValueChange when typing a number", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: number | undefined) => void>()

        render(<NumberInput size="md" value={undefined} onValueChange={handleChange} />)

        const input = screen.getByRole("textbox")
        await user.type(input, "5")

        expect(handleChange).toHaveBeenCalledWith(5)
    })

    it("calls onValueChange with undefined when value is cleared", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: number | undefined) => void>()

        render(<NumberInput size="md" value={42} onValueChange={handleChange} />)

        const input = screen.getByRole("textbox")
        await user.clear(input)

        expect(handleChange).toHaveBeenCalledWith(undefined)
    })

    it("renders increment and decrement buttons by default", () => {
        render(
            <NumberInput
                size="md"
                value={10}
                onValueChange={vi.fn<(value: number | undefined) => void>()}
            />,
        )

        const buttons = screen.getAllByRole("button")
        expect(buttons).toHaveLength(2)
    })

    it("increments value when clicking increment button", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: number | undefined) => void>()

        render(<NumberInput size="md" value={10} onValueChange={handleChange} />)

        const { increment } = getControlButtons()
        await user.click(increment)

        expect(handleChange).toHaveBeenCalledWith(11)
    })

    it("decrements value when clicking decrement button", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: number | undefined) => void>()

        render(<NumberInput size="md" value={10} onValueChange={handleChange} />)

        const { decrement } = getControlButtons()
        await user.click(decrement)

        expect(handleChange).toHaveBeenCalledWith(9)
    })

    it("does not render buttons when controls is false", () => {
        render(
            <NumberInput
                size="md"
                value={10}
                onValueChange={vi.fn<(value: number | undefined) => void>()}
                controls={false}
            />,
        )

        expect(screen.queryAllByRole("button")).toHaveLength(0)
    })

    it("respects min constraint", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: number | undefined) => void>()

        render(<NumberInput size="md" value={0} onValueChange={handleChange} min={0} />)

        const { decrement } = getControlButtons()
        await user.click(decrement)

        expect(handleChange).not.toHaveBeenCalled()
    })

    it("respects max constraint", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: number | undefined) => void>()

        render(<NumberInput size="md" value={10} onValueChange={handleChange} max={10} />)

        const { increment } = getControlButtons()
        await user.click(increment)

        expect(handleChange).not.toHaveBeenCalled()
    })

    it("respects step value", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: number | undefined) => void>()

        render(<NumberInput size="md" value={0} onValueChange={handleChange} step={5} />)

        const { increment } = getControlButtons()
        await user.click(increment)

        expect(handleChange).toHaveBeenCalledWith(5)
    })

    it("applies disabled state", () => {
        render(
            <NumberInput
                size="md"
                value={10}
                onValueChange={vi.fn<(value: number | undefined) => void>()}
                disabled={true}
            />,
        )

        const input = screen.getByRole("textbox")
        expect(input).toBeDisabled()
    })

    it("applies required state", () => {
        render(
            <NumberInput
                size="md"
                value={10}
                onValueChange={vi.fn<(value: number | undefined) => void>()}
                required={true}
            />,
        )

        const input = screen.getByRole("textbox")
        expect(input).toBeRequired()
    })

    it("inherits properties from Field", () => {
        render(
            <Field
                label="Quantity"
                required={true}
                disabled={true}
                errors={["Invalid quantity"]}
            >
                <NumberInput
                    size="md"
                    value={10}
                    onValueChange={vi.fn<(value: number | undefined) => void>()}
                />
            </Field>,
        )

        const input = screen.getByLabelText("Quantity")
        expect(input).toBeDisabled()
        expect(input).toBeRequired()
    })

    it("allows prop overrides over Field", () => {
        render(
            <Field
                label="Quantity"
                required={true}
                disabled={true}
                errors={["Invalid quantity"]}
            >
                <NumberInput
                    size="md"
                    value={10}
                    onValueChange={vi.fn<(value: number | undefined) => void>()}
                    disabled={false}
                    required={false}
                />
            </Field>,
        )

        const input = screen.getByLabelText("Quantity")
        expect(input).not.toBeDisabled()
        expect(input).not.toBeRequired()
    })
})

describe("NumberInput field callbacks", () => {
    it("records the change and the blur on the field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <NumberInput size="md" value={undefined} onValueChange={noop} />
            </FieldCallbacksForm>,
        )

        expect(queryFieldError()).not.toBeInTheDocument()

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        await user.type(screen.getByRole("textbox"), "5")
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records nothing when the field callbacks are suppressed", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <NumberInput
                    size="md"
                    value={undefined}
                    onValueChange={noop}
                    suppressFieldCallbacks={true}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        await user.type(screen.getByRole("textbox"), "5")

        expect(queryFieldError()).toBeInTheDocument()
    })
})
