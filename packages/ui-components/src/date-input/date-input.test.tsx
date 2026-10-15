import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import { formatDate } from "shared/temporal"
import { describe, expect, it, vi } from "vitest"

import { Field } from "../field/field"
import {
    fieldCallbacksLabel,
    queryFieldError,
    submitFieldCallbacksForm,
} from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { fireEvent, render, screen } from "../test/test-utils"
import { testT as t, testLocale } from "../test/ui-i18n"
import { DateInput } from "./date-input"

describe("DateInput", () => {
    describe.each(["native", "custom"] as const)("shared (%s mode)", mode => {
        it("applies disabled state", () => {
            render(
                <Field label="Date" required={false}>
                    <DateInput
                        mode={mode}
                        value={undefined}
                        onValueChange={vi.fn<(value: Date | undefined) => void>()}
                        disabled={true}
                    />
                </Field>,
            )

            expect(screen.getByLabelText("Date")).toBeDisabled()
        })

        it("applies required state", () => {
            render(
                <Field label="Date" required={false}>
                    <DateInput
                        mode={mode}
                        value={undefined}
                        onValueChange={vi.fn<(value: Date | undefined) => void>()}
                        required={true}
                    />
                </Field>,
            )

            expect(screen.getByLabelText("Date")).toBeRequired()
        })

        it("inherits properties from Field", () => {
            render(
                <Field
                    label="Date"
                    required={true}
                    disabled={true}
                    errors={["Invalid date"]}
                >
                    <DateInput
                        mode={mode}
                        value={undefined}
                        onValueChange={vi.fn<(value: Date | undefined) => void>()}
                    />
                </Field>,
            )

            const input = screen.getByLabelText("Date")
            expect(input).toBeDisabled()
            expect(input).toBeRequired()
        })

        it("allows prop overrides over Field", () => {
            render(
                <Field
                    label="Date"
                    required={true}
                    disabled={true}
                    errors={["Invalid date"]}
                >
                    <DateInput
                        mode={mode}
                        value={undefined}
                        onValueChange={vi.fn<(value: Date | undefined) => void>()}
                        disabled={false}
                        required={false}
                    />
                </Field>,
            )

            const input = screen.getByLabelText("Date")
            expect(input).not.toBeDisabled()
            expect(input).not.toBeRequired()
        })
    })

    describe("native mode", () => {
        it("renders with date type", () => {
            render(
                <Field label="Date" required={false}>
                    <DateInput
                        mode="native"
                        value={undefined}
                        onValueChange={vi.fn<(value: Date | undefined) => void>()}
                    />
                </Field>,
            )

            expect(screen.getByLabelText("Date")).toHaveAttribute("type", "date")
        })

        it("renders ISO-formatted date from a Date value", () => {
            render(
                <DateInput
                    mode="native"
                    value={new Date(2024, 5, 15)}
                    onValueChange={vi.fn<(value: Date | undefined) => void>()}
                />,
            )

            expect(screen.getByDisplayValue("2024-06-15")).toBeInTheDocument()
        })

        it("renders empty string when value is undefined", () => {
            render(
                <Field label="Date" required={false}>
                    <DateInput
                        mode="native"
                        value={undefined}
                        onValueChange={vi.fn<(value: Date | undefined) => void>()}
                    />
                </Field>,
            )

            expect(screen.getByLabelText("Date")).toHaveValue("")
        })

        it("calls onValueChange with a Date when a valid date is entered", () => {
            const handleChange = vi.fn<(value: Date | undefined) => void>()

            render(
                <Field label="Date" required={false}>
                    <DateInput
                        mode="native"
                        value={undefined}
                        onValueChange={handleChange}
                    />
                </Field>,
            )

            fireEvent.change(screen.getByLabelText("Date"), {
                target: { value: "2024-06-15" },
            })

            expect(handleChange).toHaveBeenCalledExactlyOnceWith(new Date("2024-06-15"))
        })

        it("calls onValueChange with undefined when the input is cleared", () => {
            const handleChange = vi.fn<(value: Date | undefined) => void>()

            render(
                <Field label="Date" required={false}>
                    <DateInput
                        mode="native"
                        value={new Date(2024, 5, 15)}
                        onValueChange={handleChange}
                    />
                </Field>,
            )

            fireEvent.change(screen.getByLabelText("Date"), { target: { value: "" } })

            expect(handleChange).toHaveBeenCalledWith(undefined)
        })

        it("does not call onValueChange for invalid date strings", () => {
            const handleChange = vi.fn<(value: Date | undefined) => void>()

            render(
                <Field label="Date" required={false}>
                    <DateInput
                        mode="native"
                        value={undefined}
                        onValueChange={handleChange}
                    />
                </Field>,
            )

            fireEvent.change(screen.getByLabelText("Date"), {
                target: { value: "not-a-date" },
            })

            expect(handleChange).not.toHaveBeenCalled()
        })

        it("forwards min and max as ISO-formatted dates", () => {
            render(
                <Field label="Date" required={false}>
                    <DateInput
                        mode="native"
                        value={undefined}
                        onValueChange={vi.fn<(value: Date | undefined) => void>()}
                        min={new Date(2024, 0, 1)}
                        max={new Date(2024, 11, 31)}
                    />
                </Field>,
            )

            const input = screen.getByLabelText("Date")
            expect(input).toHaveAttribute("min", "2024-01-01")
            expect(input).toHaveAttribute("max", "2024-12-31")
        })

        it("does not throw when value is an invalid Date and the user types a valid date", () => {
            const handleChange = vi.fn<(value: Date | undefined) => void>()

            render(
                <Field label="Date" required={false}>
                    <DateInput
                        mode="native"
                        value={new Date(Number.NaN)}
                        onValueChange={handleChange}
                    />
                </Field>,
            )

            expect(() => {
                fireEvent.change(screen.getByLabelText("Date"), {
                    target: { value: "2024-06-15" },
                })
            }).not.toThrow()

            expect(handleChange).toHaveBeenCalledExactlyOnceWith(new Date("2024-06-15"))
        })
    })

    describe("custom mode", () => {
        it("renders a combobox trigger", () => {
            render(
                <Field label="Date" required={false}>
                    <DateInput
                        mode="custom"
                        value={undefined}
                        onValueChange={vi.fn<(value: Date | undefined) => void>()}
                    />
                </Field>,
            )

            expect(screen.getByLabelText("Date")).toHaveAttribute("role", "combobox")
        })

        it("exposes the popover via aria-haspopup=dialog", () => {
            render(
                <DateInput
                    mode="custom"
                    value={undefined}
                    onValueChange={vi.fn<(value: Date | undefined) => void>()}
                />,
            )

            expect(screen.getByRole("combobox")).toHaveAttribute(
                "aria-haspopup",
                "dialog",
            )
        })

        it("renders the placeholder when value is undefined", () => {
            render(
                <DateInput
                    mode="custom"
                    value={undefined}
                    onValueChange={vi.fn<(value: Date | undefined) => void>()}
                />,
            )

            expect(screen.getByRole("combobox")).toHaveTextContent(
                t("DateInput.Placeholder", undefined),
            )
        })

        it("renders the formatted date when a value is provided", () => {
            const value = new Date(2024, 5, 15)
            render(
                <DateInput
                    mode="custom"
                    value={value}
                    onValueChange={vi.fn<(value: Date | undefined) => void>()}
                />,
            )

            expect(screen.getByRole("combobox")).toHaveTextContent(
                formatDate(value, { template: "PPP", locale: testLocale }),
            )
        })

        it("opens the day picker when the trigger is clicked", async () => {
            const user = userEvent.setup()

            render(
                <DateInput
                    mode="custom"
                    value={new Date(2024, 5, 15)}
                    onValueChange={vi.fn<(value: Date | undefined) => void>()}
                />,
            )

            expect(screen.queryByRole("grid")).not.toBeInTheDocument()

            await user.click(screen.getByRole("combobox"))

            expect(
                screen.getByRole("grid", {
                    name: `${t("Months.Full.june", undefined)} 2024`,
                }),
            ).toBeInTheDocument()
        })

        it("calls onValueChange when a day is picked", async () => {
            const user = userEvent.setup()
            const handleChange = vi.fn<(value: Date | undefined) => void>()

            render(
                <DateInput
                    mode="custom"
                    value={new Date(2024, 5, 15)}
                    onValueChange={handleChange}
                />,
            )

            await user.click(screen.getByRole("combobox"))
            await user.click(screen.getByRole("gridcell", { name: "20" }))

            expect(handleChange).toHaveBeenCalledExactlyOnceWith(new Date(2024, 5, 20))
        })

        it("closes the day picker after a day is picked", async () => {
            const user = userEvent.setup()

            render(
                <DateInput
                    mode="custom"
                    value={new Date(2024, 5, 15)}
                    onValueChange={vi.fn<(value: Date | undefined) => void>()}
                />,
            )

            await user.click(screen.getByRole("combobox"))
            expect(screen.getByRole("grid")).toBeInTheDocument()

            await user.click(screen.getByRole("gridcell", { name: "20" }))

            expect(screen.queryByRole("grid")).not.toBeInTheDocument()
        })

        it("forwards min and max to the day picker", async () => {
            const user = userEvent.setup()

            render(
                <DateInput
                    mode="custom"
                    value={new Date(2024, 5, 15)}
                    onValueChange={vi.fn<(value: Date | undefined) => void>()}
                    min={new Date(2024, 5, 10)}
                    max={new Date(2024, 5, 20, 23, 59, 59)}
                />,
            )

            await user.click(screen.getByRole("combobox"))

            expect(screen.getByRole("gridcell", { name: "9" })).toHaveAttribute(
                "aria-disabled",
                "true",
            )
            expect(screen.getByRole("gridcell", { name: "21" })).toHaveAttribute(
                "aria-disabled",
                "true",
            )
        })

        it("renders a reset button when a value is set", () => {
            render(
                <DateInput
                    mode="custom"
                    value={new Date(2024, 5, 15)}
                    onValueChange={vi.fn<(value: Date | undefined) => void>()}
                />,
            )

            expect(
                screen.getByRole("button", { name: t("DateInput.Reset", undefined) }),
            ).toBeInTheDocument()
        })

        it("does not render a reset button when value is undefined", () => {
            render(
                <DateInput
                    mode="custom"
                    value={undefined}
                    onValueChange={vi.fn<(value: Date | undefined) => void>()}
                />,
            )

            expect(
                screen.queryByRole("button", { name: t("DateInput.Reset", undefined) }),
            ).not.toBeInTheDocument()
        })

        it("does not render a reset button when disabled with a value", () => {
            render(
                <DateInput
                    mode="custom"
                    value={new Date(2024, 5, 15)}
                    onValueChange={vi.fn<(value: Date | undefined) => void>()}
                    disabled={true}
                />,
            )

            expect(
                screen.queryByRole("button", { name: t("DateInput.Reset", undefined) }),
            ).not.toBeInTheDocument()
        })

        it("calls onValueChange with undefined when reset is clicked", async () => {
            const user = userEvent.setup()
            const handleChange = vi.fn<(value: Date | undefined) => void>()

            render(
                <DateInput
                    mode="custom"
                    value={new Date(2024, 5, 15)}
                    onValueChange={handleChange}
                />,
            )

            await user.pointer({
                keys: "[MouseLeft>]",
                target: screen.getByRole("button", {
                    name: t("DateInput.Reset", undefined),
                }),
            })

            expect(handleChange).toHaveBeenCalledExactlyOnceWith(undefined)
        })

        it("does not open the day picker when reset is clicked", async () => {
            const user = userEvent.setup()

            render(
                <DateInput
                    mode="custom"
                    value={new Date(2024, 5, 15)}
                    onValueChange={vi.fn<(value: Date | undefined) => void>()}
                />,
            )

            await user.pointer({
                keys: "[MouseLeft>]",
                target: screen.getByRole("button", {
                    name: t("DateInput.Reset", undefined),
                }),
            })

            expect(screen.queryByRole("grid")).not.toBeInTheDocument()
        })

        it("drops a value from the day picker that violates min", async () => {
            const user = userEvent.setup()
            const handleChange = vi.fn<(value: Date | undefined) => void>()

            render(
                <DateInput
                    mode="custom"
                    value={new Date(2024, 5, 15)}
                    onValueChange={handleChange}
                    min={new Date(2024, 5, 10)}
                />,
            )

            await user.click(screen.getByRole("combobox"))
            await user.click(screen.getByRole("gridcell", { name: "9" }))

            expect(handleChange).not.toHaveBeenCalled()
        })

        it("drops a value from the day picker that violates max", async () => {
            const user = userEvent.setup()
            const handleChange = vi.fn<(value: Date | undefined) => void>()

            render(
                <DateInput
                    mode="custom"
                    value={new Date(2024, 5, 15)}
                    onValueChange={handleChange}
                    max={new Date(2024, 5, 20, 23, 59, 59)}
                />,
            )

            await user.click(screen.getByRole("combobox"))
            await user.click(screen.getByRole("gridcell", { name: "21" }))

            expect(handleChange).not.toHaveBeenCalled()
        })

        it("drops a value from the day picker that is disabled via isDayDisabled", async () => {
            const user = userEvent.setup()
            const handleChange = vi.fn<(value: Date | undefined) => void>()

            render(
                <DateInput
                    mode="custom"
                    value={new Date(2024, 5, 15)}
                    onValueChange={handleChange}
                    isDayDisabled={d => d.getDate() === 20}
                />,
            )

            await user.click(screen.getByRole("combobox"))
            await user.click(screen.getByRole("gridcell", { name: "20" }))

            expect(handleChange).not.toHaveBeenCalled()
        })

        it("forwards isDayDisabled to the day picker", async () => {
            const user = userEvent.setup()

            render(
                <DateInput
                    mode="custom"
                    value={new Date(2024, 5, 15)}
                    onValueChange={vi.fn<(value: Date | undefined) => void>()}
                    isDayDisabled={date => date.getDate() === 20}
                />,
            )

            await user.click(screen.getByRole("combobox"))

            expect(screen.getByRole("gridcell", { name: "20" })).toHaveAttribute(
                "aria-disabled",
                "true",
            )
        })

        it("does not throw when value is an invalid Date and the user opens and picks a day", async () => {
            const user = userEvent.setup()
            const handleChange = vi.fn<(value: Date | undefined) => void>()

            render(
                <DateInput
                    mode="custom"
                    value={new Date(Number.NaN)}
                    onValueChange={handleChange}
                />,
            )

            await expect(
                (async () => {
                    await user.click(screen.getByRole("combobox"))
                    await user.click(screen.getByRole("gridcell", { name: "15" }))
                })(),
            ).resolves.not.toThrow()

            expect(handleChange).toHaveBeenCalledOnce()
        })
    })
})

describe("DateInput field callbacks", () => {
    describe("native mode", () => {
        it("records the change and the blur on the field", async () => {
            const user = userEvent.setup()
            render(
                <FieldCallbacksForm>
                    <DateInput mode="native" value={undefined} onValueChange={noop} />
                </FieldCallbacksForm>,
            )

            expect(queryFieldError()).not.toBeInTheDocument()

            await submitFieldCallbacksForm(user)
            expect(queryFieldError()).toBeInTheDocument()

            const input = screen.getByLabelText(fieldCallbacksLabel)
            await user.click(input)
            fireEvent.change(input, { target: { value: "2024-06-15" } })
            expect(queryFieldError()).not.toBeInTheDocument()

            await user.tab()
            expect(queryFieldError()).toBeInTheDocument()
        })

        it("records nothing when the field callbacks are suppressed", async () => {
            const user = userEvent.setup()
            render(
                <FieldCallbacksForm>
                    <DateInput
                        mode="native"
                        value={undefined}
                        onValueChange={noop}
                        suppressFieldCallbacks={true}
                    />
                </FieldCallbacksForm>,
            )

            await submitFieldCallbacksForm(user)
            const input = screen.getByLabelText(fieldCallbacksLabel)
            await user.click(input)
            fireEvent.change(input, { target: { value: "2024-06-15" } })

            expect(queryFieldError()).toBeInTheDocument()
        })
    })

    describe("custom mode", () => {
        it("records the change on reset and the blur on close", async () => {
            const user = userEvent.setup()
            render(
                <FieldCallbacksForm>
                    <DateInput
                        mode="custom"
                        value={new Date(2024, 5, 15)}
                        onValueChange={noop}
                    />
                </FieldCallbacksForm>,
            )

            expect(queryFieldError()).not.toBeInTheDocument()

            await submitFieldCallbacksForm(user)
            expect(queryFieldError()).toBeInTheDocument()

            await user.click(
                screen.getByRole("button", { name: t("DateInput.Reset", undefined) }),
            )
            expect(queryFieldError()).not.toBeInTheDocument()

            await user.click(screen.getByRole("combobox"))
            await user.keyboard("{Escape}")
            expect(queryFieldError()).toBeInTheDocument()
        })

        it("records nothing when the field callbacks are suppressed", async () => {
            const user = userEvent.setup()
            render(
                <FieldCallbacksForm>
                    <DateInput
                        mode="custom"
                        value={new Date(2024, 5, 15)}
                        onValueChange={noop}
                        suppressFieldCallbacks={true}
                    />
                </FieldCallbacksForm>,
            )

            await submitFieldCallbacksForm(user)
            await user.click(
                screen.getByRole("button", { name: t("DateInput.Reset", undefined) }),
            )

            expect(queryFieldError()).toBeInTheDocument()
        })
    })
})
