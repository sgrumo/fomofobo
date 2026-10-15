import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import { describe, expect, it, vi } from "vitest"

import { Field } from "../field/field"
import {
    fieldCallbacksLabel,
    queryFieldError,
    submitFieldCallbacksForm,
} from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { render, screen } from "../test/test-utils"
import { PasswordInput } from "./password-input"

describe("PasswordInput", () => {
    it("renders with password type by default", () => {
        render(
            <PasswordInput
                value="secret"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                autoComplete="current-password"
            />,
        )

        const input = screen.getByDisplayValue("secret")
        expect(input).toHaveAttribute("type", "password")
    })

    it("calls onValueChange when typing", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: string | undefined) => void>()

        render(
            <PasswordInput
                value=""
                onValueChange={handleChange}
                autoComplete="new-password"
                placeholder="Enter password"
            />,
        )

        const input = screen.getByPlaceholderText("Enter password")
        await user.type(input, "a")

        expect(handleChange).toHaveBeenCalledWith("a")
    })

    it("calls onValueChange with undefined when value is cleared", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: string | undefined) => void>()

        render(
            <PasswordInput
                value="x"
                onValueChange={handleChange}
                autoComplete="new-password"
            />,
        )

        const input = screen.getByDisplayValue("x")
        await user.clear(input)

        expect(handleChange).toHaveBeenCalledWith(undefined)
    })

    it("toggles between password and text type when clicking show button", async () => {
        const user = userEvent.setup()

        render(
            <PasswordInput
                value="secret"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                autoComplete="current-password"
            />,
        )

        const input = screen.getByDisplayValue("secret")
        const toggleButton = screen.getByRole("button")

        expect(input).toHaveAttribute("type", "password")

        await user.click(toggleButton)
        expect(input).toHaveAttribute("type", "text")

        await user.click(toggleButton)
        expect(input).toHaveAttribute("type", "password")
    })

    it("does not render toggle button when allowShow is false", () => {
        render(
            <PasswordInput
                value="secret"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                autoComplete="current-password"
                allowShow={false}
            />,
        )

        const toggleButton = screen.queryByRole("button")
        expect(toggleButton).not.toBeInTheDocument()
    })

    it("applies disabled state", () => {
        render(
            <PasswordInput
                value="secret"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                autoComplete="current-password"
                disabled={true}
            />,
        )

        const input = screen.getByDisplayValue("secret")
        expect(input).toBeDisabled()
    })

    it("applies required state", () => {
        render(
            <PasswordInput
                value="secret"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                autoComplete="current-password"
                required={true}
            />,
        )

        const input = screen.getByDisplayValue("secret")
        expect(input).toBeRequired()
    })

    it("sets autocomplete attribute", () => {
        render(
            <PasswordInput
                value="test"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                autoComplete="new-password"
            />,
        )

        const input = screen.getByDisplayValue("test")
        expect(input).toHaveAttribute("autocomplete", "new-password")
    })

    it("sets inputMode attribute", () => {
        render(
            <PasswordInput
                value="1234"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                autoComplete="new-password"
                inputMode="numeric"
            />,
        )

        const input = screen.getByDisplayValue("1234")
        expect(input).toHaveAttribute("inputmode", "numeric")
    })

    it("inherits properties from Field", () => {
        render(
            <Field
                label="Password"
                required={true}
                disabled={true}
                errors={["Invalid password"]}
            >
                <PasswordInput
                    value="test"
                    onValueChange={vi.fn<(value: string | undefined) => void>()}
                    autoComplete="current-password"
                />
            </Field>,
        )

        const input = screen.getByLabelText("Password")
        expect(input).toBeDisabled()
        expect(input).toBeRequired()
    })

    it("allows prop overrides over Field", () => {
        render(
            <Field
                label="Password"
                required={true}
                disabled={true}
                errors={["Invalid password"]}
            >
                <PasswordInput
                    value="test"
                    onValueChange={vi.fn<(value: string | undefined) => void>()}
                    autoComplete="current-password"
                    disabled={false}
                    required={false}
                />
            </Field>,
        )

        const input = screen.getByLabelText("Password")
        expect(input).not.toBeDisabled()
        expect(input).not.toBeRequired()
    })

    it("does not call onValueChange when onChange is prevented", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: string | undefined) => void>()

        render(
            <PasswordInput
                value=""
                onValueChange={handleChange}
                autoComplete="new-password"
                placeholder="Enter password"
                onChange={e => {
                    e.preventDefault()
                }}
            />,
        )

        const input = screen.getByPlaceholderText("Enter password")
        await user.type(input, "a")

        expect(handleChange).not.toHaveBeenCalled()
    })

    it("sets security-related attributes", () => {
        render(
            <PasswordInput
                value="secret"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                autoComplete="new-password"
            />,
        )

        const input = screen.getByDisplayValue("secret")
        expect(input).toHaveAttribute("autocorrect", "off")
        expect(input).toHaveAttribute("spellcheck", "false")
        expect(input).toHaveAttribute("autocapitalize", "off")
    })
})

describe("PasswordInput field callbacks", () => {
    it("records the change and the blur on the field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <PasswordInput
                    value={undefined}
                    onValueChange={noop}
                    autoComplete="current-password"
                />
            </FieldCallbacksForm>,
        )

        expect(queryFieldError()).not.toBeInTheDocument()

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        await user.type(screen.getByLabelText(fieldCallbacksLabel), "a")
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.tab()
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records nothing when the field callbacks are suppressed", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <PasswordInput
                    value={undefined}
                    onValueChange={noop}
                    autoComplete="current-password"
                    suppressFieldCallbacks={true}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        await user.type(screen.getByLabelText(fieldCallbacksLabel), "a")

        expect(queryFieldError()).toBeInTheDocument()
    })
})
