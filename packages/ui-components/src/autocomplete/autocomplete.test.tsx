import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import { describe, expect, it, vi } from "vitest"
import { z } from "zod"

import { Field } from "../field/field"
import { queryFieldError, submitFieldCallbacksForm } from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { render, screen } from "../test/test-utils"
import { testT as t } from "../test/ui-i18n"
import { Autocomplete } from "./autocomplete"

const fruitSchema = z.object({
    id: z.string(),
    label: z.string(),
})
type Fruit = z.infer<typeof fruitSchema>

const fruits: Fruit[] = [
    { id: "1", label: "Apple" },
    { id: "2", label: "Banana" },
    { id: "3", label: "Cherry" },
]

/**
 * @description Renders the autocomplete, inside a `Field` when `fieldLabel` is set
 * @param props Autocomplete and `Field` overrides
 */
const renderAutocomplete = (props: {
    value?: string
    onValueChange?: (value: string) => void
    loading?: boolean
    disabled?: boolean
    fieldLabel?: string
    fieldDisabled?: boolean
    renderItem?: (props: { item: Fruit }) => React.ReactNode
}) => {
    const autocomplete = (
        <Autocomplete
            itemSchema={fruitSchema}
            items={fruits}
            value={props.value}
            onValueChange={props.onValueChange ?? noop}
            getItemId={fruit => fruit.id}
            getItemValue={fruit => fruit.label}
            renderItem={props.renderItem ?? (({ item }) => <span>{item.label}</span>)}
            loading={props.loading}
            disabled={props.disabled}
        />
    )

    if (props.fieldLabel !== undefined) {
        return render(
            <Field
                required={false}
                label={props.fieldLabel}
                disabled={props.fieldDisabled}
            >
                {autocomplete}
            </Field>,
        )
    }

    return render(autocomplete)
}

describe("Autocomplete", () => {
    it("renders an input", () => {
        renderAutocomplete({})

        expect(screen.getByRole("combobox")).toBeInTheDocument()
    })

    it("shows options when typing", async () => {
        const user = userEvent.setup()
        renderAutocomplete({})

        await user.click(screen.getByRole("combobox"))
        await user.type(screen.getByRole("combobox"), "a")

        expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument()
        expect(await screen.findByRole("option", { name: "Banana" })).toBeInTheDocument()
    })

    it("filters options based on input", async () => {
        const user = userEvent.setup()
        renderAutocomplete({})

        await user.type(screen.getByRole("combobox"), "ban")

        expect(await screen.findByRole("option", { name: "Banana" })).toBeInTheDocument()
        expect(screen.queryByRole("option", { name: "Cherry" })).not.toBeInTheDocument()
    })

    it("calls onValueChange when an option is selected", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: string) => void>()
        renderAutocomplete({ onValueChange: handleValueChange })

        await user.type(screen.getByRole("combobox"), "App")
        await user.click(await screen.findByRole("option", { name: "Apple" }))

        expect(handleValueChange).toHaveBeenCalledWith("Apple", expect.anything())
    })

    it("calls onValueChange with string value even when renderItem returns JSX", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: string) => void>()
        renderAutocomplete({
            onValueChange: handleValueChange,
            renderItem: ({ item }) => (
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full" />
                    {item.label}
                </div>
            ),
        })

        await user.type(screen.getByRole("combobox"), "App")
        await user.click(await screen.findByRole("option", { name: "Apple" }))

        expect(handleValueChange).toHaveBeenCalledWith("Apple", expect.anything())
    })

    it("renders custom renderItem content in options", async () => {
        const user = userEvent.setup()
        renderAutocomplete({
            renderItem: ({ item }) => (
                <div className="flex items-center gap-2">
                    <div
                        data-testid={`circle-${item.id}`}
                        className="size-3 rounded-full"
                    />
                    {item.label}
                </div>
            ),
        })

        await user.type(screen.getByRole("combobox"), "a")

        expect(await screen.findByTestId("circle-1")).toBeInTheDocument()
        expect(screen.getByTestId("circle-2")).toBeInTheDocument()
    })

    it("shows empty message when no options match", async () => {
        const user = userEvent.setup()
        renderAutocomplete({})

        await user.type(screen.getByRole("combobox"), "xyz")

        expect(
            await screen.findByText(t("Combobox.Empty", undefined)),
        ).toBeInTheDocument()
    })

    it("disables input when disabled prop is true", () => {
        renderAutocomplete({ disabled: true })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("disables input when loading is true", () => {
        renderAutocomplete({ loading: true })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("inherits disabled state from Field", () => {
        renderAutocomplete({ fieldLabel: "Fruit", fieldDisabled: true })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("inherits id from Field", () => {
        renderAutocomplete({ fieldLabel: "Fruit" })

        expect(screen.getByLabelText("Fruit")).toBeInTheDocument()
    })

    it("displays the current value in the input", () => {
        renderAutocomplete({ value: "Apple" })

        expect(screen.getByRole("combobox")).toHaveValue("Apple")
    })
})

describe("Autocomplete field callbacks", () => {
    it("records the change and the blur on the field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Autocomplete
                    itemSchema={fruitSchema}
                    items={fruits}
                    value={undefined}
                    onValueChange={noop}
                    getItemId={fruit => fruit.id}
                    getItemValue={fruit => fruit.label}
                    renderItem={({ item }) => <span>{item.label}</span>}
                />
            </FieldCallbacksForm>,
        )

        expect(queryFieldError()).not.toBeInTheDocument()

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        await user.type(screen.getByRole("combobox"), "a")
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.keyboard("{Escape}")
        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records nothing when the field callbacks are suppressed", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Autocomplete
                    itemSchema={fruitSchema}
                    items={fruits}
                    value={undefined}
                    onValueChange={noop}
                    getItemId={fruit => fruit.id}
                    getItemValue={fruit => fruit.label}
                    renderItem={({ item }) => <span>{item.label}</span>}
                    suppressFieldCallbacks={true}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        await user.type(screen.getByRole("combobox"), "a")

        expect(queryFieldError()).toBeInTheDocument()
    })
})
