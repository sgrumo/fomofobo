import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Field } from "../field/field"
import { queryFieldError, submitFieldCallbacksForm } from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { render, screen } from "../test/test-utils"
import { testT as t } from "../test/ui-i18n"
import { OtpInput } from "./otp-input"

const slotLabel = (position: number) => t("OtpInput.Slot", { position })

/**
 * @description Returns the accessible name a slot takes inside a field
 * @param position Slot position read
 * @param label Field label joined with the slot position
 */
const slotName = (position: number, label: string) => `${slotLabel(position)} ${label}`

/**
 * @description Returns the slot input at a 1-based position
 * @param position Slot position read
 * @throws When the render holds no slot at that position
 */
const getSlot = (position: number) => {
    const slot = screen.getAllByRole("textbox")[position - 1]
    if (!slot) {
        throw new Error(`Expected a slot at position ${String(position)}`)
    }
    return slot
}

interface ControlledOtpInputProps {
    length: number
    initialValue?: string
    validationType?: "numeric" | "alphanumeric"
    onValueChange?: (value: string | undefined) => void
    onValueComplete?: (value: string) => void
}
const ControlledOtpInput = (props: ControlledOtpInputProps) => {
    const [value, setValue] = useState<string | undefined>(props.initialValue)

    return (
        <Field label="Code" required={false}>
            <OtpInput
                length={props.length}
                validationType={props.validationType}
                value={value}
                onValueChange={nextValue => {
                    setValue(nextValue)
                    props.onValueChange?.(nextValue)
                }}
                onValueComplete={props.onValueComplete}
            />
        </Field>
    )
}

describe("OtpInput", () => {
    it("renders one input per character", () => {
        render(
            <OtpInput
                length={6}
                value={undefined}
                onValueChange={noop}
                aria-label="Code"
            />,
        )

        expect(screen.getAllByRole("textbox")).toHaveLength(6)
    })

    it("renders the value one character per slot", () => {
        render(
            <OtpInput length={4} value="1234" onValueChange={noop} aria-label="Code" />,
        )

        expect(getSlot(1)).toHaveValue("1")
        expect(getSlot(2)).toHaveValue("2")
        expect(getSlot(3)).toHaveValue("3")
        expect(getSlot(4)).toHaveValue("4")
    })

    it("renders empty slots when the value is undefined", () => {
        render(
            <OtpInput
                length={3}
                value={undefined}
                onValueChange={noop}
                aria-label="Code"
            />,
        )

        expect(getSlot(1)).toHaveValue("")
        expect(getSlot(2)).toHaveValue("")
        expect(getSlot(3)).toHaveValue("")
    })

    it("names every slot with its position and the field label", () => {
        render(<ControlledOtpInput length={3} />)

        expect(screen.getByRole("group", { name: "Code" })).toBeInTheDocument()
        expect(getSlot(1)).toHaveAccessibleName(slotName(1, "Code"))
        expect(getSlot(2)).toHaveAccessibleName(slotName(2, "Code"))
        expect(getSlot(3)).toHaveAccessibleName(slotName(3, "Code"))
    })

    it("names every slot by position alone without a field", () => {
        render(
            <OtpInput
                length={2}
                value={undefined}
                onValueChange={noop}
                aria-label="Code"
            />,
        )

        expect(getSlot(1)).toHaveAccessibleName(slotLabel(1))
        expect(getSlot(2)).toHaveAccessibleName(slotLabel(2))
    })

    it("calls onValueChange with the value typed across the slots", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: string | undefined) => void>()
        render(<ControlledOtpInput length={4} onValueChange={handleChange} />)

        await user.type(getSlot(1), "1234")

        expect(handleChange).toHaveBeenLastCalledWith("1234")
        expect(getSlot(4)).toHaveValue("4")
    })

    it("calls onValueComplete once every slot holds a character", async () => {
        const user = userEvent.setup()
        const handleComplete = vi.fn<(value: string) => void>()
        render(<ControlledOtpInput length={4} onValueComplete={handleComplete} />)

        await user.type(getSlot(1), "123")

        expect(handleComplete).not.toHaveBeenCalled()

        await user.type(getSlot(4), "4")

        expect(handleComplete).toHaveBeenCalledWith("1234")
    })

    it("calls onValueChange with undefined when the value is cleared", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: string | undefined) => void>()
        render(
            <ControlledOtpInput
                length={4}
                initialValue="1234"
                onValueChange={handleChange}
            />,
        )

        await user.click(getSlot(1))
        await user.keyboard("{Control>}{Backspace}{/Control}")

        expect(handleChange).toHaveBeenLastCalledWith(undefined)
        expect(getSlot(1)).toHaveValue("")
    })

    it("rejects a letter with the default numeric validation", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: string | undefined) => void>()
        render(<ControlledOtpInput length={4} onValueChange={handleChange} />)

        await user.type(getSlot(1), "a")

        expect(handleChange).not.toHaveBeenCalled()
        expect(getSlot(1)).toHaveValue("")
    })

    it("accepts a letter with the alphanumeric validation", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: string | undefined) => void>()
        render(
            <ControlledOtpInput
                length={4}
                validationType="alphanumeric"
                onValueChange={handleChange}
            />,
        )

        await user.type(getSlot(1), "a1")

        expect(handleChange).toHaveBeenLastCalledWith("a1")
    })

    it("masks every slot when mask is true", () => {
        render(
            <OtpInput
                length={4}
                mask={true}
                value="12"
                onValueChange={noop}
                aria-label="Code"
            />,
        )

        expect(screen.getByLabelText(slotLabel(2))).toHaveAttribute("type", "password")
    })

    it("renders a separator between the slot groups", () => {
        render(
            <OtpInput
                length={6}
                groupSize={3}
                value={undefined}
                onValueChange={noop}
                aria-label="Code"
            />,
        )

        expect(screen.getAllByRole("separator")).toHaveLength(1)
        expect(screen.getAllByRole("textbox")).toHaveLength(6)
    })

    it("renders no separator without a group size", () => {
        render(
            <OtpInput
                length={6}
                value={undefined}
                onValueChange={noop}
                aria-label="Code"
            />,
        )

        expect(screen.queryByRole("separator")).not.toBeInTheDocument()
    })

    it("disables every slot when the field is disabled", () => {
        render(
            <Field label="Code" required={false} disabled={true}>
                <OtpInput length={3} value="123" onValueChange={noop} />
            </Field>,
        )

        expect(getSlot(1)).toBeDisabled()
        expect(getSlot(2)).toBeDisabled()
        expect(getSlot(3)).toBeDisabled()
    })

    it("marks every slot required when the field is required", () => {
        render(
            <Field label="Code" required={true}>
                <OtpInput length={2} value={undefined} onValueChange={noop} />
            </Field>,
        )

        expect(getSlot(1)).toBeRequired()
        expect(getSlot(2)).toBeRequired()
    })

    it("renders the value without inputs in view mode", () => {
        render(
            <Field label="Code" required={false} mode="view">
                <OtpInput length={6} value="123456" onValueChange={noop} />
            </Field>,
        )

        expect(screen.getByText("123456")).toBeInTheDocument()
        expect(screen.queryAllByRole("textbox")).toHaveLength(0)
    })

    it("masks the value in view mode", () => {
        render(
            <Field label="Code" required={false} mode="view">
                <OtpInput length={4} mask={true} value="1234" onValueChange={noop} />
            </Field>,
        )

        expect(screen.getByText("••••")).toBeInTheDocument()
    })
})

describe("OtpInput field callbacks", () => {
    it("records the change and the blur on the field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <OtpInput length={4} value={undefined} onValueChange={noop} />
            </FieldCallbacksForm>,
        )

        expect(queryFieldError()).not.toBeInTheDocument()

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        await user.type(getSlot(1), "1")
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records nothing when the field callbacks are suppressed", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <OtpInput
                    length={4}
                    value={undefined}
                    onValueChange={noop}
                    suppressFieldCallbacks={true}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        await user.type(getSlot(1), "1")

        expect(queryFieldError()).toBeInTheDocument()
    })
})
