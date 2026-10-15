import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import type { ChangeEvent } from "react"
import { describe, expect, it, vi } from "vitest"

import { Field } from "../field/field"
import {
    fieldCallbacksLabel,
    queryFieldError,
    submitFieldCallbacksForm,
} from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { render, screen } from "../test/test-utils"
import { StringInput } from "./string-input"

describe("StringInput", () => {
    it("renders with text type by default", () => {
        render(
            <StringInput
                value="hello"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
            />,
        )

        const input = screen.getByDisplayValue("hello")
        expect(input).toHaveAttribute("type", "text")
    })

    it("renders with specified type", () => {
        render(
            <StringInput
                type="email"
                value="test@example.com"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
            />,
        )

        const input = screen.getByDisplayValue("test@example.com")
        expect(input).toHaveAttribute("type", "email")
    })

    it("calls onValueChange when typing", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: string | undefined) => void>()

        render(
            <StringInput
                value=""
                onValueChange={handleChange}
                placeholder="Enter text"
            />,
        )

        const input = screen.getByPlaceholderText("Enter text")
        await user.type(input, "a")

        expect(handleChange).toHaveBeenCalledWith("a")
    })

    it("calls onValueChange with undefined when value is cleared", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: string | undefined) => void>()

        render(<StringInput value="x" onValueChange={handleChange} />)

        const input = screen.getByDisplayValue("x")
        await user.clear(input)

        expect(handleChange).toHaveBeenCalledWith(undefined)
    })

    it("renders empty string when value is undefined", () => {
        render(
            <StringInput
                value={undefined}
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                placeholder="Empty"
            />,
        )

        const input = screen.getByPlaceholderText("Empty")
        expect(input).toHaveValue("")
    })

    it("applies disabled state", () => {
        render(
            <StringInput
                value="test"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                disabled={true}
            />,
        )

        const input = screen.getByDisplayValue("test")
        expect(input).toBeDisabled()
    })

    it("applies required state", () => {
        render(
            <StringInput
                value="test"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                required={true}
            />,
        )

        const input = screen.getByDisplayValue("test")
        expect(input).toBeRequired()
    })

    it("calls custom onChange handler", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>()
        const handleValueChange = vi.fn<(value: string | undefined) => void>()

        render(
            <StringInput
                value=""
                onValueChange={handleValueChange}
                onChange={handleChange}
                placeholder="Enter text"
            />,
        )

        const input = screen.getByPlaceholderText("Enter text")
        await user.type(input, "a")

        expect(handleChange).toHaveBeenCalledWith(expect.anything())
        expect(handleValueChange).toHaveBeenCalledWith("a")
    })

    it("inherits properties from Field", () => {
        render(
            <Field
                label="Email"
                required={true}
                disabled={true}
                errors={["Invalid email"]}
            >
                <StringInput
                    type="email"
                    value=""
                    onValueChange={vi.fn<(value: string | undefined) => void>()}
                />
            </Field>,
        )

        const input = screen.getByLabelText("Email")
        expect(input).toBeDisabled()
        expect(input).toBeRequired()
    })

    it("allows prop overrides over Field", () => {
        render(
            <Field
                label="Email"
                required={true}
                disabled={true}
                errors={["Invalid email"]}
            >
                <StringInput
                    type="email"
                    value=""
                    onValueChange={vi.fn<(value: string | undefined) => void>()}
                    disabled={false}
                    required={false}
                />
            </Field>,
        )

        const input = screen.getByLabelText("Email")
        expect(input).not.toBeDisabled()
        expect(input).not.toBeRequired()
    })

    it("renders with prefix and suffix", () => {
        render(
            <StringInput
                value="100"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                prefix="$"
                suffix="USD"
            />,
        )

        expect(screen.getByText("$")).toBeInTheDocument()
        expect(screen.getByText("USD")).toBeInTheDocument()
        expect(screen.getByDisplayValue("100")).toBeInTheDocument()
    })
})

describe("StringInput field callbacks", () => {
    it("records the change and the blur on the field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <StringInput value={undefined} onValueChange={noop} />
            </FieldCallbacksForm>,
        )

        expect(queryFieldError()).not.toBeInTheDocument()

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        await user.type(screen.getByLabelText(fieldCallbacksLabel), "a")
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records nothing when the field callbacks are suppressed", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <StringInput
                    value={undefined}
                    onValueChange={noop}
                    suppressFieldCallbacks={true}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        await user.type(screen.getByLabelText(fieldCallbacksLabel), "a")

        expect(queryFieldError()).toBeInTheDocument()
    })
})
