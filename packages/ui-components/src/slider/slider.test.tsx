import { fireEvent } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import { describe, expect, it, vi } from "vitest"

import { Field } from "../field/field"
import { queryFieldError, submitFieldCallbacksForm } from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { render, screen } from "../test/test-utils"
import { Slider } from "./slider"

describe("Slider", () => {
    it("renders a slider", () => {
        render(<Slider value={50} onValueChange={noop} />)

        expect(screen.getByRole("slider")).toBeInTheDocument()
    })

    it("sets aria-valuenow to the current value", () => {
        render(<Slider value={50} onValueChange={noop} />)

        expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "50")
    })

    it("sets min to the min value", () => {
        render(<Slider value={50} min={10} onValueChange={noop} />)

        expect(screen.getByRole("slider")).toHaveAttribute("min", "10")
    })

    it("sets max to the max value", () => {
        render(<Slider value={50} max={200} onValueChange={noop} />)

        expect(screen.getByRole("slider")).toHaveAttribute("max", "200")
    })

    it("is disabled when disabled prop is true", () => {
        render(<Slider value={50} onValueChange={noop} disabled={true} />)

        expect(screen.getByRole("slider")).toBeDisabled()
    })

    it("calls onValueChange when incremented via keyboard", () => {
        const handleValueChange = vi.fn<(value: number) => void>()
        render(
            <Slider
                value={50}
                onValueChange={handleValueChange}
                min={0}
                max={100}
                step={1}
            />,
        )

        const slider = screen.getByRole("slider")
        fireEvent.focus(slider)
        fireEvent.keyDown(slider, { key: "ArrowRight" })

        expect(handleValueChange).toHaveBeenCalledWith(51)
    })

    it("inherits aria-labelledby from Field", () => {
        render(
            <Field required={false} label="Volume">
                <Slider value={50} onValueChange={noop} />
            </Field>,
        )

        const label = screen.getByText("Volume")
        expect(screen.getByRole("slider")).toHaveAttribute("aria-labelledby", label.id)
    })

    it("inherits disabled from Field", () => {
        render(
            <Field required={false} label="Volume" disabled={true}>
                <Slider value={50} onValueChange={noop} />
            </Field>,
        )

        expect(screen.getByRole("slider")).toBeDisabled()
    })

    it("prop overrides Field disabled", () => {
        render(
            <Field required={false} label="Volume" disabled={true}>
                <Slider value={50} onValueChange={noop} disabled={false} />
            </Field>,
        )

        expect(screen.getByRole("slider")).not.toBeDisabled()
    })

    it("calls onValueChange when decremented via keyboard", () => {
        const handleValueChange = vi.fn<(value: number) => void>()
        render(
            <Slider
                value={50}
                onValueChange={handleValueChange}
                min={0}
                max={100}
                step={1}
            />,
        )

        const slider = screen.getByRole("slider")
        fireEvent.focus(slider)
        fireEvent.keyDown(slider, { key: "ArrowLeft" })

        expect(handleValueChange).toHaveBeenCalledWith(49)
    })
})

describe("Slider field callbacks", () => {
    it("records the change and the blur on the field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Slider value={50} onValueChange={noop} min={0} max={100} step={1} />
            </FieldCallbacksForm>,
        )

        expect(queryFieldError()).not.toBeInTheDocument()

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        screen.getByRole("slider").focus()
        await user.keyboard("{ArrowRight}")
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records nothing when the field callbacks are suppressed", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Slider
                    value={50}
                    onValueChange={noop}
                    min={0}
                    max={100}
                    step={1}
                    suppressFieldCallbacks={true}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        screen.getByRole("slider").focus()
        await user.keyboard("{ArrowRight}")

        expect(queryFieldError()).toBeInTheDocument()
    })
})
