import { userEvent } from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Field } from "../field/field"
import {
    fieldCallbacksLabel,
    queryFieldError,
    submitFieldCallbacksForm,
} from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { render, screen } from "../test/test-utils"
import { Input } from "./input"

describe("Input", () => {
    it("renders with text type by default", () => {
        render(<Input placeholder="Enter text" />)

        const input = screen.getByPlaceholderText("Enter text")
        expect(input).toHaveAttribute("type", "text")
    })

    it("renders with specified type", () => {
        render(<Input type="email" placeholder="Enter email" />)

        const input = screen.getByPlaceholderText("Enter email")
        expect(input).toHaveAttribute("type", "email")
    })

    it("applies disabled state", () => {
        render(<Input placeholder="Disabled input" disabled={true} />)

        const input = screen.getByPlaceholderText("Disabled input")
        expect(input).toBeDisabled()
    })

    it("applies required state", () => {
        render(<Input placeholder="Required input" required={true} />)

        const input = screen.getByPlaceholderText("Required input")
        expect(input).toBeRequired()
    })

    it("renders prefix", () => {
        render(<Input placeholder="Amount" prefix="$" />)

        expect(screen.getByText("$")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Amount")).toBeInTheDocument()
    })

    it("renders suffix", () => {
        render(<Input placeholder="Weight" suffix="kg" />)

        expect(screen.getByText("kg")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Weight")).toBeInTheDocument()
    })

    it("renders both prefix and suffix", () => {
        render(<Input placeholder="Price" prefix="$" suffix="USD" />)

        expect(screen.getByText("$")).toBeInTheDocument()
        expect(screen.getByText("USD")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Price")).toBeInTheDocument()
    })

    it("renders icon on left side by default", () => {
        render(<Input placeholder="Search" icon={<span data-testid="icon">🔍</span>} />)

        expect(screen.getByTestId("icon")).toBeInTheDocument()
    })

    it("renders icon on right side when specified", () => {
        render(
            <Input
                placeholder="Search"
                icon={<span data-testid="icon">🔍</span>}
                iconSide="right"
            />,
        )

        expect(screen.getByTestId("icon")).toBeInTheDocument()
    })

    it("inherits properties from Field", () => {
        render(
            <Field
                label="Username"
                description="Your public handle"
                required={true}
                disabled={true}
                errors={["Invalid username"]}
            >
                <Input />
            </Field>,
        )

        const input = screen.getByLabelText("Username")
        expect(input).toBeDisabled()
        expect(input).toBeRequired()
        expect(input).toHaveAccessibleDescription("Your public handle")
    })

    it("allows prop overrides over Field", () => {
        render(
            <>
                <span id="custom-description">Overridden description</span>
                <Field
                    label="Username"
                    description="Your public handle"
                    required={true}
                    disabled={true}
                    errors={["Invalid username"]}
                >
                    <Input
                        disabled={false}
                        required={false}
                        aria-describedby="custom-description"
                    />
                </Field>
            </>,
        )

        const input = screen.getByLabelText("Username")
        expect(input).not.toBeDisabled()
        expect(input).not.toBeRequired()
        expect(input).toHaveAccessibleDescription("Overridden description")
    })

    it("forwards native input props", () => {
        render(
            <Input
                placeholder="Max length"
                maxLength={10}
                minLength={2}
                pattern="[A-Za-z]+"
            />,
        )

        const input = screen.getByPlaceholderText("Max length")
        expect(input).toHaveAttribute("maxLength", "10")
        expect(input).toHaveAttribute("minLength", "2")
        expect(input).toHaveAttribute("pattern", "[A-Za-z]+")
    })
})

describe("Input field callbacks", () => {
    it("records the change and the blur on the field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Input />
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
                <Input suppressFieldCallbacks={true} />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        await user.type(screen.getByLabelText(fieldCallbacksLabel), "a")

        expect(queryFieldError()).toBeInTheDocument()
    })
})
