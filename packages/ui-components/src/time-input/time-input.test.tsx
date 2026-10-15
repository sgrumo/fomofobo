import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import type { Time } from "shared/temporal"
import { describe, expect, it, vi } from "vitest"

import { Field } from "../field/field"
import {
    fieldCallbacksLabel,
    queryFieldError,
    submitFieldCallbacksForm,
} from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { fireEvent, render, screen } from "../test/test-utils"
import { TimeInput } from "./time-input"

describe("TimeInput", () => {
    it("renders with time type", () => {
        render(
            <Field label="Time" required={false}>
                <TimeInput
                    value={undefined}
                    onValueChange={vi.fn<(value: Time | undefined) => void>()}
                />
            </Field>,
        )

        expect(screen.getByLabelText("Time")).toHaveAttribute("type", "time")
    })

    it("renders ISO-formatted time from a Time value", () => {
        render(
            <TimeInput
                value={{ hours: 14, minutes: 30, seconds: 0, milliseconds: 0 }}
                onValueChange={vi.fn<(value: Time | undefined) => void>()}
            />,
        )

        expect(screen.getByDisplayValue("14:30")).toBeInTheDocument()
    })

    it("renders empty string when value is undefined", () => {
        render(
            <Field label="Time" required={false}>
                <TimeInput
                    value={undefined}
                    onValueChange={vi.fn<(value: Time | undefined) => void>()}
                />
            </Field>,
        )

        expect(screen.getByLabelText("Time")).toHaveValue("")
    })

    it("calls onValueChange with a Time when a valid time is entered", () => {
        const handleChange = vi.fn<(value: Time | undefined) => void>()

        render(
            <Field label="Time" required={false}>
                <TimeInput value={undefined} onValueChange={handleChange} />
            </Field>,
        )

        fireEvent.change(screen.getByLabelText("Time"), {
            target: { value: "09:05" },
        })

        expect(handleChange).toHaveBeenCalledExactlyOnceWith<[Time]>({
            hours: 9,
            minutes: 5,
            seconds: 0,
            milliseconds: 0,
        })
    })

    it("calls onValueChange with undefined when the input is cleared", () => {
        const handleChange = vi.fn<(value: Time | undefined) => void>()

        render(
            <Field label="Time" required={false}>
                <TimeInput
                    value={{ hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }}
                    onValueChange={handleChange}
                />
            </Field>,
        )

        fireEvent.change(screen.getByLabelText("Time"), { target: { value: "" } })

        expect(handleChange).toHaveBeenCalledWith(undefined)
    })

    it("calls onValueChange only once when cleared", () => {
        const handleChange = vi.fn<(value: Time | undefined) => void>()

        render(
            <Field label="Time" required={false}>
                <TimeInput
                    value={{ hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }}
                    onValueChange={handleChange}
                />
            </Field>,
        )

        fireEvent.change(screen.getByLabelText("Time"), { target: { value: "" } })

        expect(handleChange).toHaveBeenCalledOnce()
    })

    it("applies disabled state", () => {
        render(
            <Field label="Time" required={false}>
                <TimeInput
                    value={undefined}
                    onValueChange={vi.fn<(value: Time | undefined) => void>()}
                    disabled={true}
                />
            </Field>,
        )

        expect(screen.getByLabelText("Time")).toBeDisabled()
    })

    it("applies required state", () => {
        render(
            <Field label="Time" required={false}>
                <TimeInput
                    value={undefined}
                    onValueChange={vi.fn<(value: Time | undefined) => void>()}
                    required={true}
                />
            </Field>,
        )

        expect(screen.getByLabelText("Time")).toBeRequired()
    })

    it("inherits properties from Field", () => {
        render(
            <Field label="Time" required={true} disabled={true} errors={["Invalid time"]}>
                <TimeInput
                    value={undefined}
                    onValueChange={vi.fn<(value: Time | undefined) => void>()}
                />
            </Field>,
        )

        const input = screen.getByLabelText("Time")
        expect(input).toBeDisabled()
        expect(input).toBeRequired()
    })

    it("allows prop overrides over Field", () => {
        render(
            <Field label="Time" required={true} disabled={true} errors={["Invalid time"]}>
                <TimeInput
                    value={undefined}
                    onValueChange={vi.fn<(value: Time | undefined) => void>()}
                    disabled={false}
                    required={false}
                />
            </Field>,
        )

        const input = screen.getByLabelText("Time")
        expect(input).not.toBeDisabled()
        expect(input).not.toBeRequired()
    })
})

describe("TimeInput field callbacks", () => {
    it("records the change and the blur on the field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <TimeInput value={undefined} onValueChange={noop} />
            </FieldCallbacksForm>,
        )

        expect(queryFieldError()).not.toBeInTheDocument()

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        const input = screen.getByLabelText(fieldCallbacksLabel)
        await user.click(input)
        fireEvent.change(input, { target: { value: "10:30" } })
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records nothing when the field callbacks are suppressed", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <TimeInput
                    value={undefined}
                    onValueChange={noop}
                    suppressFieldCallbacks={true}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        const input = screen.getByLabelText(fieldCallbacksLabel)
        await user.click(input)
        fireEvent.change(input, { target: { value: "10:30" } })

        expect(queryFieldError()).toBeInTheDocument()
    })
})
