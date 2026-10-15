import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import { describe, expect, it, vi } from "vitest"

import { Field } from "../field/field"
import { queryFieldError, submitFieldCallbacksForm } from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { render, screen } from "../test/test-utils"
import { Switch } from "./switch"

describe("Switch", () => {
    it("renders a switch", () => {
        render(<Switch value={false} onValueChange={noop} />)

        expect(screen.getByRole("switch")).toBeInTheDocument()
    })

    it("is off when value is false", () => {
        render(<Switch value={false} onValueChange={noop} />)

        expect(screen.getByRole("switch")).not.toBeChecked()
    })

    it("is on when value is true", () => {
        render(<Switch value={true} onValueChange={noop} />)

        expect(screen.getByRole("switch")).toBeChecked()
    })

    it("calls onValueChange with true when turned on", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: boolean) => void>()
        render(<Switch value={false} onValueChange={handleValueChange} />)

        await user.click(screen.getByRole("switch"))

        expect(handleValueChange).toHaveBeenCalledWith(true, expect.anything())
    })

    it("calls onValueChange with false when turned off", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: boolean) => void>()
        render(<Switch value={true} onValueChange={handleValueChange} />)

        await user.click(screen.getByRole("switch"))

        expect(handleValueChange).toHaveBeenCalledWith(false, expect.anything())
    })

    it("is disabled when disabled prop is true", () => {
        render(<Switch value={false} onValueChange={noop} disabled={true} />)

        expect(screen.getByRole("switch")).toBeDisabled()
    })

    it("is required when required prop is true", () => {
        render(<Switch value={false} onValueChange={noop} required={true} />)

        expect(screen.getByRole("switch")).toHaveAttribute("aria-required", "true")
    })

    it("inherits label from Field", () => {
        render(
            <Field required={false} label="Enable notifications">
                <Switch value={false} onValueChange={noop} />
            </Field>,
        )

        expect(
            screen.getByLabelText("Enable notifications", {
                selector: '[role="switch"]',
            }),
        ).toBeInTheDocument()
    })

    it("inherits disabled from Field", () => {
        render(
            <Field required={false} label="Enable notifications" disabled={true}>
                <Switch value={false} onValueChange={noop} />
            </Field>,
        )

        expect(screen.getByRole("switch")).toBeDisabled()
    })

    it("inherits required from Field", () => {
        render(
            <Field label="Enable notifications" required={true}>
                <Switch value={false} onValueChange={noop} />
            </Field>,
        )

        expect(screen.getByRole("switch")).toHaveAttribute("aria-required", "true")
    })

    it("prop overrides Field disabled", () => {
        render(
            <Field required={false} label="Enable notifications" disabled={true}>
                <Switch value={false} onValueChange={noop} disabled={false} />
            </Field>,
        )

        expect(screen.getByRole("switch")).not.toBeDisabled()
    })

    it("prop overrides Field required", () => {
        render(
            <Field label="Enable notifications" required={true}>
                <Switch value={false} onValueChange={noop} required={false} />
            </Field>,
        )

        expect(screen.getByRole("switch")).not.toHaveAttribute("aria-required", "true")
    })
})

describe("Switch field callbacks", () => {
    it("records the change and the blur on the field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Switch value={false} onValueChange={noop} />
            </FieldCallbacksForm>,
        )

        expect(queryFieldError()).not.toBeInTheDocument()

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        await user.click(screen.getByRole("switch"))
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records nothing when the field callbacks are suppressed", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Switch
                    value={false}
                    onValueChange={noop}
                    suppressFieldCallbacks={true}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        await user.click(screen.getByRole("switch"))

        expect(queryFieldError()).toBeInTheDocument()
    })
})
