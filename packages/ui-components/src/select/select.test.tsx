import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Field } from "../field/field"
import { queryFieldError, submitFieldCallbacksForm } from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { render, screen } from "../test/test-utils"
import { testT as t } from "../test/ui-i18n"
import { Select } from "./select"

interface Fruit {
    id: string
    label: string
}

const apple: Fruit = { id: "1", label: "Apple" }
const banana: Fruit = { id: "2", label: "Banana" }
const cherry: Fruit = { id: "3", label: "Cherry" }
const fruits: Fruit[] = [apple, banana, cherry]

/**
 * @description Renders a single-value `Select`, optionally inside a `Field`
 * @param props Select and field overrides
 * @remarks Defaults `resettable` to `true` and `items` to the fruit fixture
 */
const renderSingleSelect = (props: {
    value?: Fruit | undefined
    onValueChange?: (value: Fruit | undefined) => void
    items?: Fruit[]
    resettable?: boolean
    loading?: boolean
    disabled?: boolean
    placeholder?: string
    fieldLabel?: string
    fieldDisabled?: boolean
}) => {
    const select = (
        <Select
            multiple={false}
            resettable={props.resettable ?? true}
            items={props.items ?? fruits}
            value={props.value}
            onValueChange={props.onValueChange ?? noop}
            getItemId={fruit => fruit.id}
            renderItem={({ item }) => <span>{item.label}</span>}
            loading={props.loading}
            disabled={props.disabled}
            placeholder={props.placeholder}
        />
    )

    if (props.fieldLabel !== undefined) {
        return render(
            <Field
                required={false}
                label={props.fieldLabel}
                disabled={props.fieldDisabled}
            >
                {select}
            </Field>,
        )
    }

    return render(select)
}

/**
 * @description Renders a multi-value `Select`, optionally inside a `Field`
 * @param props Select and field overrides
 * @remarks Defaults `resettable` to `true` and `items` to the fruit fixture
 */
const renderMultiSelect = (props: {
    value?: Fruit[]
    onValueChange?: (value: Fruit[]) => void
    items?: Fruit[]
    resettable?: boolean
    loading?: boolean
    disabled?: boolean
    placeholder?: string
    fieldLabel?: string
    fieldDisabled?: boolean
}) => {
    const select = (
        <Select
            multiple={true}
            resettable={props.resettable ?? true}
            items={props.items ?? fruits}
            value={props.value ?? []}
            onValueChange={props.onValueChange ?? noop}
            getItemId={fruit => fruit.id}
            renderItem={({ item }) => <span>{item.label}</span>}
            loading={props.loading}
            disabled={props.disabled}
            placeholder={props.placeholder}
        />
    )

    if (props.fieldLabel !== undefined) {
        return render(
            <Field
                required={false}
                label={props.fieldLabel}
                disabled={props.fieldDisabled}
            >
                {select}
            </Field>,
        )
    }

    return render(select)
}

describe("Single Select", () => {
    it("renders a trigger with placeholder", () => {
        renderSingleSelect({})

        expect(screen.getByRole("combobox")).toBeInTheDocument()
        expect(screen.getByText(t("Combobox.Placeholder", undefined))).toBeInTheDocument()
    })

    it("renders the custom placeholder when empty", () => {
        renderSingleSelect({ placeholder: "Pick a fruit" })

        expect(screen.getByText("Pick a fruit")).toBeInTheDocument()
        expect(
            screen.queryByText(t("Combobox.Placeholder", undefined)),
        ).not.toBeInTheDocument()
    })

    it("shows options when trigger is clicked", async () => {
        const user = userEvent.setup()
        renderSingleSelect({})

        await user.click(screen.getByRole("combobox"))

        expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Cherry" })).toBeInTheDocument()
    })

    it("calls onValueChange when an option is selected", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit | undefined) => void>()
        renderSingleSelect({ onValueChange: handleValueChange })

        await user.click(screen.getByRole("combobox"))
        await user.click(await screen.findByRole("option", { name: "Banana" }))

        expect(handleValueChange).toHaveBeenCalledWith(banana)
    })

    it("displays the selected value in the trigger", () => {
        renderSingleSelect({ value: apple })

        expect(screen.getByText("Apple")).toBeInTheDocument()
    })

    it("shows reset button when a value is selected", () => {
        renderSingleSelect({ value: apple })

        expect(screen.getByRole("button")).toBeInTheDocument()
    })

    it("does not show reset button when no value is selected", () => {
        renderSingleSelect({})

        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("calls onValueChange with undefined when reset is clicked", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit | undefined) => void>()
        renderSingleSelect({ value: apple, onValueChange: handleValueChange })

        await user.pointer({
            keys: "[MouseLeft>]",
            target: screen.getByRole("button"),
        })

        expect(handleValueChange).toHaveBeenCalledWith(undefined)
    })

    it("keeps the popup closed when reset is clicked", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit | undefined) => void>()
        renderSingleSelect({ value: apple, onValueChange: handleValueChange })

        await user.click(
            screen.getByRole("button", { name: t("Combobox.Reset", undefined) }),
        )

        expect(handleValueChange).toHaveBeenCalledWith(undefined)
        expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "false")
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })

    it("resets on Enter when the reset holds focus", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit | undefined) => void>()
        renderSingleSelect({ value: apple, onValueChange: handleValueChange })

        screen.getByRole("button", { name: t("Combobox.Reset", undefined) }).focus()
        await user.keyboard("{Enter}")

        expect(handleValueChange).toHaveBeenCalledWith(undefined)
        expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "false")
    })

    it("does not show reset button when not resettable, even with a value", () => {
        renderSingleSelect({ value: apple, resettable: false })

        expect(screen.queryByRole("button")).not.toBeInTheDocument()
        expect(screen.getByText("Apple")).toBeInTheDocument()
    })

    it("disables trigger when disabled prop is true", () => {
        renderSingleSelect({ disabled: true })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("disables trigger when loading is true", () => {
        renderSingleSelect({ loading: true })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("inherits disabled state from Field", () => {
        renderSingleSelect({ fieldLabel: "Fruit", fieldDisabled: true })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("inherits id from Field", () => {
        renderSingleSelect({ fieldLabel: "Fruit" })

        expect(screen.getByLabelText("Fruit")).toBeInTheDocument()
    })

    it("injects current value into options when not in items list", async () => {
        const user = userEvent.setup()
        const missingFruit: Fruit = { id: "99", label: "Dragonfruit" }
        renderSingleSelect({ value: missingFruit, items: fruits })

        expect(screen.getByText("Dragonfruit")).toBeInTheDocument()

        await user.click(screen.getByRole("combobox"))

        expect(
            await screen.findByRole("option", { name: "Dragonfruit" }),
        ).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument()
    })
})

describe("Multiple Select", () => {
    it("renders a trigger with placeholder", () => {
        renderMultiSelect({})

        expect(screen.getByRole("combobox")).toBeInTheDocument()
        expect(screen.getByText(t("Combobox.Placeholder", undefined))).toBeInTheDocument()
    })

    it("renders the custom placeholder when empty", () => {
        renderMultiSelect({ placeholder: "Pick some fruit" })

        expect(screen.getByText("Pick some fruit")).toBeInTheDocument()
        expect(
            screen.queryByText(t("Combobox.Placeholder", undefined)),
        ).not.toBeInTheDocument()
    })

    it("shows options when trigger is clicked", async () => {
        const user = userEvent.setup()
        renderMultiSelect({})

        await user.click(screen.getByRole("combobox"))

        expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Cherry" })).toBeInTheDocument()
    })

    it("calls onValueChange with selected items", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit[]) => void>()
        renderMultiSelect({ onValueChange: handleValueChange })

        await user.click(screen.getByRole("combobox"))
        await user.click(await screen.findByRole("option", { name: "Apple" }))

        expect(handleValueChange).toHaveBeenCalledWith([apple])
    })

    it("displays single selected value in the trigger", () => {
        renderMultiSelect({ value: [apple] })

        expect(screen.getByText("Apple")).toBeInTheDocument()
    })

    it("displays first value and count when multiple selected", () => {
        renderMultiSelect({ value: [apple, banana, cherry] })

        const trigger = screen.getByRole("combobox")
        expect(trigger).toHaveTextContent("Apple")
        expect(trigger).toHaveTextContent(t("Combobox.Chips.NMorePlural", { count: 2 }))
    })

    it("shows reset button when values are selected", () => {
        renderMultiSelect({ value: [apple] })

        expect(screen.getByRole("button")).toBeInTheDocument()
    })

    it("does not show reset button when no values are selected", () => {
        renderMultiSelect({ value: [] })

        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("calls onValueChange with empty array when reset is clicked", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit[]) => void>()
        renderMultiSelect({ value: [apple], onValueChange: handleValueChange })

        await user.pointer({
            keys: "[MouseLeft>]",
            target: screen.getByRole("button"),
        })

        expect(handleValueChange).toHaveBeenCalledWith([])
    })

    it("does not show reset button when not resettable, even with values", () => {
        renderMultiSelect({ value: [apple], resettable: false })

        expect(screen.queryByRole("button")).not.toBeInTheDocument()
        expect(screen.getByText("Apple")).toBeInTheDocument()
    })

    it("disables trigger when disabled prop is true", () => {
        renderMultiSelect({ disabled: true })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("disables trigger when loading is true", () => {
        renderMultiSelect({ loading: true })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("inherits disabled state from Field", () => {
        renderMultiSelect({ fieldLabel: "Fruit", fieldDisabled: true })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("inherits id from Field", () => {
        renderMultiSelect({ fieldLabel: "Fruit" })

        expect(screen.getByLabelText("Fruit")).toBeInTheDocument()
    })

    it("injects current values into options when not in items list", async () => {
        const user = userEvent.setup()
        const missingFruits: Fruit[] = [
            { id: "98", label: "Starfruit" },
            { id: "99", label: "Dragonfruit" },
        ]
        renderMultiSelect({ value: missingFruits, items: fruits })

        await user.click(screen.getByRole("combobox"))

        expect(
            await screen.findByRole("option", { name: "Starfruit" }),
        ).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Dragonfruit" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument()
    })
})

const HookedFruitItem = (props: { item: Fruit }) => {
    // SAFETY: this is a test file
    // oxlint-disable-next-line react/hook-use-state
    const [label] = useState(props.item.label)
    return <span>{label}</span>
}

describe("Select item component using hooks", () => {
    it("renders without hook errors when the items list shrinks", () => {
        const select = (items: Fruit[]) => (
            <Select
                multiple={false}
                resettable={true}
                items={items}
                value={undefined}
                onValueChange={noop}
                getItemId={fruit => fruit.id}
                renderItem={HookedFruitItem}
            />
        )

        const { rerender } = render(select(fruits))

        expect(() => {
            rerender(select(fruits.slice(0, 2)))
        }).not.toThrow()
    })
})

describe("Select field callbacks", () => {
    it("records the change on selection and the blur on close", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Select
                    multiple={true}
                    resettable={true}
                    items={fruits}
                    value={[]}
                    onValueChange={noop}
                    getItemId={fruit => fruit.id}
                    renderItem={({ item }) => <span>{item.label}</span>}
                />
            </FieldCallbacksForm>,
        )

        expect(queryFieldError()).not.toBeInTheDocument()

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        await user.click(screen.getByRole("combobox"))
        await user.click(await screen.findByRole("option", { name: "Banana" }))
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.keyboard("{Escape}")
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records the change on reset and the blur on tab away", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Select
                    multiple={false}
                    resettable={true}
                    items={fruits}
                    value={apple}
                    onValueChange={noop}
                    getItemId={fruit => fruit.id}
                    renderItem={({ item }) => <span>{item.label}</span>}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        await user.click(
            screen.getByRole("button", { name: t("Combobox.Reset", undefined) }),
        )
        expect(queryFieldError()).not.toBeInTheDocument()

        screen.getByRole("combobox").focus()
        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records nothing when the field callbacks are suppressed", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Select
                    multiple={false}
                    resettable={true}
                    items={fruits}
                    value={apple}
                    onValueChange={noop}
                    getItemId={fruit => fruit.id}
                    renderItem={({ item }) => <span>{item.label}</span>}
                    suppressFieldCallbacks={true}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        await user.click(
            screen.getByRole("button", { name: t("Combobox.Reset", undefined) }),
        )

        expect(queryFieldError()).toBeInTheDocument()
    })
})
