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
import { Textarea } from "./textarea"

describe("Textarea", () => {
    it("renders a textarea element", () => {
        render(
            <Textarea
                value="hello"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
            />,
        )

        const textarea = screen.getByDisplayValue("hello")
        expect(textarea.tagName).toBe("TEXTAREA")
    })

    it("calls onValueChange when typing", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: string | undefined) => void>()

        render(
            <Textarea value="" onValueChange={handleChange} placeholder="Enter text" />,
        )

        const textarea = screen.getByPlaceholderText("Enter text")
        await user.type(textarea, "a")

        expect(handleChange).toHaveBeenCalledWith("a")
    })

    it("calls onValueChange with undefined when value is cleared", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: string | undefined) => void>()

        render(<Textarea value="x" onValueChange={handleChange} />)

        const textarea = screen.getByDisplayValue("x")
        await user.clear(textarea)

        expect(handleChange).toHaveBeenCalledWith(undefined)
    })

    it("renders empty string when value is undefined", () => {
        render(
            <Textarea
                value={undefined}
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                placeholder="Empty"
            />,
        )

        const textarea = screen.getByPlaceholderText("Empty")
        expect(textarea).toHaveValue("")
    })

    it("applies disabled state", () => {
        render(
            <Textarea
                value="test"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                disabled={true}
            />,
        )

        const textarea = screen.getByDisplayValue("test")
        expect(textarea).toBeDisabled()
    })

    it("applies required state", () => {
        render(
            <Textarea
                value="test"
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                required={true}
            />,
        )

        const textarea = screen.getByDisplayValue("test")
        expect(textarea).toBeRequired()
    })

    it("applies rows attribute", () => {
        render(
            <Textarea
                value=""
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                placeholder="Message"
                rows={6}
            />,
        )

        const textarea = screen.getByPlaceholderText("Message")
        expect(textarea).toHaveAttribute("rows", "6")
    })

    it("calls custom onChange handler", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(event: ChangeEvent<HTMLTextAreaElement>) => void>()
        const handleValueChange = vi.fn<(value: string | undefined) => void>()

        render(
            <Textarea
                value=""
                onValueChange={handleValueChange}
                onChange={handleChange}
                placeholder="Enter text"
            />,
        )

        const textarea = screen.getByPlaceholderText("Enter text")
        await user.type(textarea, "a")

        expect(handleChange).toHaveBeenCalledWith(expect.anything())
        expect(handleValueChange).toHaveBeenCalledWith("a")
    })

    it("inherits properties from Field", () => {
        render(
            <Field label="Bio" required={true} disabled={true} errors={["Required"]}>
                <Textarea
                    value=""
                    onValueChange={vi.fn<(value: string | undefined) => void>()}
                />
            </Field>,
        )

        const textarea = screen.getByLabelText("Bio")
        expect(textarea).toBeDisabled()
        expect(textarea).toBeRequired()
    })

    it("allows prop overrides over Field", () => {
        render(
            <Field label="Bio" required={true} disabled={true} errors={["Required"]}>
                <Textarea
                    value=""
                    onValueChange={vi.fn<(value: string | undefined) => void>()}
                    disabled={false}
                    required={false}
                />
            </Field>,
        )

        const textarea = screen.getByLabelText("Bio")
        expect(textarea).not.toBeDisabled()
        expect(textarea).not.toBeRequired()
    })

    it("forwards native textarea props", () => {
        render(
            <Textarea
                value=""
                onValueChange={vi.fn<(value: string | undefined) => void>()}
                placeholder="Max length"
                maxLength={100}
                minLength={5}
            />,
        )

        const textarea = screen.getByPlaceholderText("Max length")
        expect(textarea).toHaveAttribute("maxLength", "100")
        expect(textarea).toHaveAttribute("minLength", "5")
    })
})

describe("Textarea field callbacks", () => {
    it("records the change and the blur on the field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Textarea value={undefined} onValueChange={noop} />
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
                <Textarea
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
