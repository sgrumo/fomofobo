import { userEvent } from "@testing-library/user-event"
import { identity, noop } from "es-toolkit"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Field } from "../field/field"
import { queryFieldError, submitFieldCallbacksForm } from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { render, screen, waitFor } from "../test/test-utils"
import { testT as t } from "../test/ui-i18n"
import { Combobox } from "./combobox"

interface Fruit {
    id: string
    label: string
}

const apple: Fruit = { id: "1", label: "Apple" }
const banana: Fruit = { id: "2", label: "Banana" }
const cherry: Fruit = { id: "3", label: "Cherry" }
const fruits: Fruit[] = [apple, banana, cherry]

/**
 * @description Renders a single combobox, inside a `Field` when `fieldLabel` is set
 * @param props Combobox and `Field` overrides
 */
const renderSingleCombobox = (props: {
    value?: Fruit | undefined
    onValueChange?: (value: Fruit | undefined) => void
    items?: Fruit[]
    resettable?: boolean
    loading?: boolean
    disabled?: boolean
    fieldLabel?: string
    fieldDisabled?: boolean
}) => {
    const combobox = (
        <Combobox
            type="standard"
            async={false}
            multiple={false}
            resettable={props.resettable ?? true}
            items={props.items ?? fruits}
            value={props.value}
            onValueChange={props.onValueChange ?? noop}
            getItemId={fruit => fruit.id}
            getItemLabel={fruit => fruit.label}
            renderItem={({ item }) => <span>{item.label}</span>}
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
                {combobox}
            </Field>,
        )
    }

    return render(combobox)
}

/**
 * @description Renders a multiple combobox, inside a `Field` when `fieldLabel` is set
 * @param props Combobox and `Field` overrides
 */
const renderMultiCombobox = (props: {
    value?: Fruit[]
    onValueChange?: (value: Fruit[]) => void
    items?: Fruit[]
    resettable?: boolean
    loading?: boolean
    disabled?: boolean
    fieldLabel?: string
    fieldDisabled?: boolean
}) => {
    const combobox = (
        <Combobox
            type="standard"
            async={false}
            multiple={true}
            resettable={props.resettable ?? true}
            items={props.items ?? fruits}
            value={props.value ?? []}
            onValueChange={props.onValueChange ?? noop}
            getItemId={fruit => fruit.id}
            getItemLabel={fruit => fruit.label}
            renderItem={({ item }) => <span>{item.label}</span>}
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
                {combobox}
            </Field>,
        )
    }

    return render(combobox)
}

describe("Single Combobox", () => {
    it("renders a trigger with placeholder", () => {
        renderSingleCombobox({})

        expect(screen.getByRole("combobox")).toBeInTheDocument()
        expect(screen.getByText(t("Combobox.Placeholder", undefined))).toBeInTheDocument()
    })

    it("shows options when trigger is clicked", async () => {
        const user = userEvent.setup()
        renderSingleCombobox({})

        await user.click(screen.getByRole("combobox"))

        expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Cherry" })).toBeInTheDocument()
    })

    it("shows search input inside popup", async () => {
        const user = userEvent.setup()
        renderSingleCombobox({})

        await user.click(screen.getByRole("combobox"))

        expect(
            await screen.findByPlaceholderText(
                t("Combobox.Search.Placeholder", undefined),
            ),
        ).toBeInTheDocument()
    })

    it("filters items when typing in search input", async () => {
        const user = userEvent.setup()
        renderSingleCombobox({})

        await user.click(screen.getByRole("combobox"))
        await user.type(
            await screen.findByPlaceholderText(
                t("Combobox.Search.Placeholder", undefined),
            ),
            "ban",
        )

        expect(await screen.findByRole("option", { name: "Banana" })).toBeInTheDocument()
        expect(screen.queryByRole("option", { name: "Apple" })).not.toBeInTheDocument()
        expect(screen.queryByRole("option", { name: "Cherry" })).not.toBeInTheDocument()
    })

    it("shows empty message when no items match filter", async () => {
        const user = userEvent.setup()
        renderSingleCombobox({})

        await user.click(screen.getByRole("combobox"))
        await user.type(
            await screen.findByPlaceholderText(
                t("Combobox.Search.Placeholder", undefined),
            ),
            "zzz",
        )

        expect(
            await screen.findByText(t("Combobox.Empty", undefined)),
        ).toBeInTheDocument()
    })

    it("calls onValueChange when an option is selected", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit | undefined) => void>()
        renderSingleCombobox({ onValueChange: handleValueChange })

        await user.click(screen.getByRole("combobox"))
        await user.click(await screen.findByRole("option", { name: "Banana" }))

        expect(handleValueChange).toHaveBeenCalledWith(banana)
    })

    it("displays the selected value in the trigger", () => {
        renderSingleCombobox({ value: apple })

        expect(screen.getByText("Apple")).toBeInTheDocument()
    })

    it("shows reset button when a value is selected", () => {
        renderSingleCombobox({ value: apple })

        expect(screen.getByRole("button")).toBeInTheDocument()
    })

    it("does not show reset button when no value is selected", () => {
        renderSingleCombobox({})

        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("calls onValueChange with undefined when reset is clicked", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit | undefined) => void>()
        renderSingleCombobox({ value: apple, onValueChange: handleValueChange })

        await user.pointer({
            keys: "[MouseLeft>]",
            target: screen.getByRole("button"),
        })

        expect(handleValueChange).toHaveBeenCalledWith(undefined)
    })

    it("keeps the popup closed when reset is clicked", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit | undefined) => void>()
        renderSingleCombobox({ value: apple, onValueChange: handleValueChange })

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
        renderSingleCombobox({ value: apple, onValueChange: handleValueChange })

        screen.getByRole("button", { name: t("Combobox.Reset", undefined) }).focus()
        await user.keyboard("{Enter}")

        expect(handleValueChange).toHaveBeenCalledWith(undefined)
        expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "false")
    })

    it("does not show reset button when not resettable, even with a value", () => {
        renderSingleCombobox({ value: apple, resettable: false })

        expect(
            screen.queryByRole("button", { name: t("Combobox.Reset", undefined) }),
        ).not.toBeInTheDocument()
        expect(screen.getByText("Apple")).toBeInTheDocument()
    })

    it("disables trigger when disabled prop is true", () => {
        renderSingleCombobox({ disabled: true })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("disables trigger when loading is true", () => {
        renderSingleCombobox({ loading: true })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("inherits disabled state from Field", () => {
        renderSingleCombobox({ fieldLabel: "Fruit", fieldDisabled: true })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("inherits id from Field", () => {
        renderSingleCombobox({ fieldLabel: "Fruit" })

        expect(screen.getByLabelText("Fruit")).toBeInTheDocument()
    })

    it("does not show reset button when disabled with a value", () => {
        renderSingleCombobox({ value: apple, disabled: true })

        expect(
            screen.queryByRole("button", { name: t("Combobox.Reset", undefined) }),
        ).not.toBeInTheDocument()
    })

    it("injects current value into options when not in items list", async () => {
        const user = userEvent.setup()
        const dragonfruit: Fruit = { id: "99", label: "Dragonfruit" }
        renderSingleCombobox({ value: dragonfruit, items: fruits })

        expect(screen.getByText("Dragonfruit")).toBeInTheDocument()

        await user.click(screen.getByRole("combobox"))

        expect(
            await screen.findByRole("option", { name: "Dragonfruit" }),
        ).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument()
    })
})

/**
 * @description Renders an async single combobox driven by an external search
 * @param props Combobox overrides
 */
const renderAsyncSingleCombobox = (props: {
    value?: Fruit | undefined
    onValueChange?: (value: Fruit | undefined) => void
    items?: Fruit[]
    fetching?: boolean
    search?: string
    onSearchChange?: (search: string) => void
    minimumSearchLength?: number
}) =>
    render(
        <Combobox
            type="standard"
            multiple={false}
            async={true}
            resettable={true}
            items={props.items ?? fruits}
            value={props.value}
            onValueChange={props.onValueChange ?? noop}
            getItemId={fruit => fruit.id}
            getItemLabel={fruit => fruit.label}
            renderItem={({ item }) => <span>{item.label}</span>}
            fetching={props.fetching ?? false}
            search={props.search ?? ""}
            onSearchChange={props.onSearchChange ?? noop}
            minimumSearchLength={props.minimumSearchLength ?? 1}
        />,
    )

/**
 * @description Renders an async multiple combobox driven by an external search
 * @param props Combobox overrides
 */
const renderAsyncMultiCombobox = (props: {
    value?: Fruit[]
    onValueChange?: (value: Fruit[]) => void
    items?: Fruit[]
    fetching?: boolean
    search?: string
    onSearchChange?: (search: string) => void
    minimumSearchLength?: number
}) =>
    render(
        <Combobox
            type="standard"
            multiple={true}
            async={true}
            resettable={true}
            items={props.items ?? fruits}
            value={props.value ?? []}
            onValueChange={props.onValueChange ?? noop}
            getItemId={fruit => fruit.id}
            getItemLabel={fruit => fruit.label}
            renderItem={({ item }) => <span>{item.label}</span>}
            fetching={props.fetching ?? false}
            search={props.search ?? ""}
            onSearchChange={props.onSearchChange ?? noop}
            minimumSearchLength={props.minimumSearchLength ?? 1}
        />,
    )

describe("Async Single Combobox", () => {
    it("shows search prompt when minimumSearchLength is 1 and search is empty", async () => {
        const user = userEvent.setup()
        renderAsyncSingleCombobox({ minimumSearchLength: 1, search: "" })

        await user.click(screen.getByRole("combobox"))

        expect(
            await screen.findByText(
                t("Combobox.Search.Prompt.NoMinimumLength", undefined),
            ),
        ).toBeInTheDocument()
    })

    it("shows search prompt with length when minimumSearchLength is greater than 1", async () => {
        const user = userEvent.setup()
        renderAsyncSingleCombobox({ minimumSearchLength: 3, search: "ab" })

        await user.click(screen.getByRole("combobox"))

        expect(
            await screen.findByText(
                t("Combobox.Search.Prompt.MinimumLength", { minLength: 3 }),
            ),
        ).toBeInTheDocument()
    })

    it("shows loading spinner when fetching", async () => {
        const user = userEvent.setup()
        renderAsyncSingleCombobox({ fetching: true, search: "app" })

        await user.click(screen.getByRole("combobox"))

        const spinners = await screen.findAllByTitle(t("Combobox.Loading", undefined))
        expect(spinners.length).toBeGreaterThan(0)
    })

    it("hides options while fetching", async () => {
        const user = userEvent.setup()
        renderAsyncSingleCombobox({ fetching: true, search: "app", items: fruits })

        await user.click(screen.getByRole("combobox"))

        const spinners = await screen.findAllByTitle(t("Combobox.Loading", undefined))
        expect(spinners.length).toBeGreaterThan(0)
        expect(screen.queryByRole("option")).not.toBeInTheDocument()
    })

    it("shows options when search satisfies minimumSearchLength and not fetching", async () => {
        const user = userEvent.setup()
        renderAsyncSingleCombobox({
            minimumSearchLength: 2,
            search: "app",
            items: fruits,
        })

        await user.click(screen.getByRole("combobox"))

        expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument()
    })

    it("does not filter items client-side in async mode (trusts server)", async () => {
        const user = userEvent.setup()
        const Wrapper = () => {
            const [search, setSearch] = useState("")
            return (
                <Combobox
                    type="standard"
                    multiple={false}
                    async={true}
                    resettable={true}
                    items={fruits}
                    value={undefined}
                    onValueChange={noop}
                    getItemId={fruit => fruit.id}
                    getItemLabel={fruit => fruit.label}
                    renderItem={({ item }) => <span>{item.label}</span>}
                    fetching={false}
                    search={search}
                    onSearchChange={setSearch}
                    minimumSearchLength={1}
                />
            )
        }
        render(<Wrapper />)

        await user.click(screen.getByRole("combobox"))
        await user.type(
            await screen.findByPlaceholderText(
                t("Combobox.Search.Placeholder", undefined),
            ),
            "x",
        )

        expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Cherry" })).toBeInTheDocument()
    })

    it("hides options when search does not satisfy minimumSearchLength", async () => {
        const user = userEvent.setup()
        renderAsyncSingleCombobox({ minimumSearchLength: 3, search: "ap", items: fruits })

        await user.click(screen.getByRole("combobox"))

        await screen.findByText(
            t("Combobox.Search.Prompt.MinimumLength", { minLength: 3 }),
        )
        expect(screen.queryByRole("option")).not.toBeInTheDocument()
    })

    it("calls onSearchChange when typing in search input", async () => {
        const user = userEvent.setup()
        const handleSearchChange = vi.fn<(search: string) => void>()
        renderAsyncSingleCombobox({ search: "", onSearchChange: handleSearchChange })

        await user.click(screen.getByRole("combobox"))
        await user.type(
            await screen.findByPlaceholderText(
                t("Combobox.Search.Placeholder", undefined),
            ),
            "a",
        )

        expect(handleSearchChange).toHaveBeenCalledWith("a")
    })

    it("does not inject current value into options list (unlike sync)", async () => {
        const user = userEvent.setup()
        const dragonfruit: Fruit = { id: "99", label: "Dragonfruit" }
        renderAsyncSingleCombobox({
            value: dragonfruit,
            items: fruits,
            search: "drag",
            minimumSearchLength: 1,
        })

        await user.click(screen.getByRole("combobox"))

        expect(
            screen.queryByRole("option", { name: "Dragonfruit" }),
        ).not.toBeInTheDocument()
    })
})

describe("Async Multiple Combobox", () => {
    it("shows search prompt when minimumSearchLength is 1 and search is empty", async () => {
        const user = userEvent.setup()
        renderAsyncMultiCombobox({ minimumSearchLength: 1, search: "" })

        await user.click(screen.getByRole("combobox"))

        expect(
            await screen.findByText(
                t("Combobox.Search.Prompt.NoMinimumLength", undefined),
            ),
        ).toBeInTheDocument()
    })

    it("shows search prompt with length when minimumSearchLength is greater than 1", async () => {
        const user = userEvent.setup()
        renderAsyncMultiCombobox({ minimumSearchLength: 3, search: "ab" })

        await user.click(screen.getByRole("combobox"))

        expect(
            await screen.findByText(
                t("Combobox.Search.Prompt.MinimumLength", { minLength: 3 }),
            ),
        ).toBeInTheDocument()
    })

    it("shows loading spinner when fetching", async () => {
        const user = userEvent.setup()
        renderAsyncMultiCombobox({ fetching: true, search: "app" })

        await user.click(screen.getByRole("combobox"))

        const spinners = await screen.findAllByTitle(t("Combobox.Loading", undefined))
        expect(spinners.length).toBeGreaterThan(0)
    })

    it("hides options while fetching", async () => {
        const user = userEvent.setup()
        renderAsyncMultiCombobox({ fetching: true, search: "app", items: fruits })

        await user.click(screen.getByRole("combobox"))

        const spinners = await screen.findAllByTitle(t("Combobox.Loading", undefined))
        expect(spinners.length).toBeGreaterThan(0)
        expect(screen.queryByRole("option")).not.toBeInTheDocument()
    })

    it("shows options when search satisfies minimumSearchLength and not fetching", async () => {
        const user = userEvent.setup()
        renderAsyncMultiCombobox({ minimumSearchLength: 2, search: "app", items: fruits })

        await user.click(screen.getByRole("combobox"))

        expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument()
    })

    it("calls onSearchChange when typing in search input", async () => {
        const user = userEvent.setup()
        const handleSearchChange = vi.fn<(search: string) => void>()
        renderAsyncMultiCombobox({ search: "", onSearchChange: handleSearchChange })

        await user.click(screen.getByRole("combobox"))
        await user.type(
            await screen.findByPlaceholderText(
                t("Combobox.Search.Placeholder", undefined),
            ),
            "b",
        )

        expect(handleSearchChange).toHaveBeenCalledWith("b")
    })

    it("calls onValueChange when an option is selected", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit[]) => void>()
        renderAsyncMultiCombobox({
            search: "ban",
            minimumSearchLength: 1,
            items: fruits,
            onValueChange: handleValueChange,
        })

        await user.click(screen.getByRole("combobox"))
        await user.click(await screen.findByRole("option", { name: "Banana" }))

        expect(handleValueChange).toHaveBeenCalledWith([banana])
    })
})

describe("Multiple Combobox", () => {
    it("renders a trigger with placeholder", () => {
        renderMultiCombobox({})

        expect(screen.getByRole("combobox")).toBeInTheDocument()
        expect(screen.getByText(t("Combobox.Placeholder", undefined))).toBeInTheDocument()
    })

    it("shows options when trigger is clicked", async () => {
        const user = userEvent.setup()
        renderMultiCombobox({})

        await user.click(screen.getByRole("combobox"))

        expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Cherry" })).toBeInTheDocument()
    })

    it("shows search input inside popup", async () => {
        const user = userEvent.setup()
        renderMultiCombobox({})

        await user.click(screen.getByRole("combobox"))

        expect(
            await screen.findByPlaceholderText(
                t("Combobox.Search.Placeholder", undefined),
            ),
        ).toBeInTheDocument()
    })

    it("filters items when typing in search input", async () => {
        const user = userEvent.setup()
        renderMultiCombobox({})

        await user.click(screen.getByRole("combobox"))
        await user.type(
            await screen.findByPlaceholderText(
                t("Combobox.Search.Placeholder", undefined),
            ),
            "che",
        )

        expect(await screen.findByRole("option", { name: "Cherry" })).toBeInTheDocument()
        expect(screen.queryByRole("option", { name: "Apple" })).not.toBeInTheDocument()
        expect(screen.queryByRole("option", { name: "Banana" })).not.toBeInTheDocument()
    })

    it("calls onValueChange with selected items", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit[]) => void>()
        renderMultiCombobox({ onValueChange: handleValueChange })

        await user.click(screen.getByRole("combobox"))
        await user.click(await screen.findByRole("option", { name: "Apple" }))

        expect(handleValueChange).toHaveBeenCalledWith([apple])
    })

    it("displays chips for selected values in the trigger", () => {
        renderMultiCombobox({ value: [apple, banana] })

        expect(screen.getByText("Apple")).toBeInTheDocument()
        expect(screen.getByText("Banana")).toBeInTheDocument()
    })

    it("shows a remove button for each chip and a reset button when values are selected", () => {
        renderMultiCombobox({ value: [apple, banana] })

        expect(screen.getAllByRole("button")).toHaveLength(3)
    })

    it("calls onValueChange without the removed item when a chip remove is clicked", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit[]) => void>()
        renderMultiCombobox({ value: [apple, banana], onValueChange: handleValueChange })

        const appleRemove = screen.getAllByRole("button").at(0)
        expect.assert(appleRemove)
        await user.click(appleRemove)

        expect(handleValueChange).toHaveBeenCalledWith([banana])
    })

    it("shows reset button when values are selected", () => {
        renderMultiCombobox({ value: [apple] })

        expect(
            screen.getByRole("button", { name: t("Combobox.Reset", undefined) }),
        ).toBeInTheDocument()
    })

    it("does not show reset button when no values are selected", () => {
        renderMultiCombobox({})

        expect(
            screen.queryByRole("button", { name: t("Combobox.Reset", undefined) }),
        ).not.toBeInTheDocument()
    })

    it("calls onValueChange with empty array when reset is clicked", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit[]) => void>()
        renderMultiCombobox({ value: [apple, banana], onValueChange: handleValueChange })

        await user.pointer({
            keys: "[MouseLeft>]",
            target: screen.getByRole("button", { name: t("Combobox.Reset", undefined) }),
        })

        expect(handleValueChange).toHaveBeenCalledWith([])
    })

    it("does not show reset button when not resettable, but keeps chip removes", () => {
        renderMultiCombobox({ value: [apple], resettable: false })

        expect(
            screen.queryByRole("button", { name: t("Combobox.Reset", undefined) }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: t("Combobox.Chips.Remove", undefined) }),
        ).toBeInTheDocument()
    })

    it("disables trigger when disabled prop is true", () => {
        renderMultiCombobox({ disabled: true })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("disables trigger when loading is true", () => {
        renderMultiCombobox({ loading: true })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("inherits disabled state from Field", () => {
        renderMultiCombobox({ fieldLabel: "Fruit", fieldDisabled: true })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("inherits id from Field", () => {
        renderMultiCombobox({ fieldLabel: "Fruit" })

        expect(screen.getByLabelText("Fruit")).toBeInTheDocument()
    })

    it("does not show reset button when disabled with values", () => {
        renderMultiCombobox({ value: [apple, banana], disabled: true })

        expect(
            screen.queryByRole("button", { name: t("Combobox.Reset", undefined) }),
        ).not.toBeInTheDocument()
    })

    it("does not show chip remove buttons when disabled but shows chips", () => {
        renderMultiCombobox({ value: [apple, banana], disabled: true })

        expect(screen.queryAllByRole("button")).toHaveLength(0)
        expect(screen.getByText("Apple")).toBeInTheDocument()
        expect(screen.getByText("Banana")).toBeInTheDocument()
    })

    it("injects current values into options when not in items list", async () => {
        const user = userEvent.setup()
        const missingFruits: Fruit[] = [
            { id: "98", label: "Starfruit" },
            { id: "99", label: "Dragonfruit" },
        ]
        renderMultiCombobox({ value: missingFruits, items: fruits })

        await user.click(screen.getByRole("combobox"))

        expect(
            await screen.findByRole("option", { name: "Starfruit" }),
        ).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Dragonfruit" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument()
    })
})

/**
 * @description Returns a promise never settling
 * @template T Resolved value type
 */
const pendingPromise = <T,>() => new Promise<T>(noop)

/**
 * @description Renders a single combobox reading its items from the query
 * @template D Query data type
 * @param props Query settings and combobox overrides
 */
const renderQuerySingleCombobox = <D,>(props: {
    queryKey: unknown[]
    queryFn: () => Promise<D>
    getItemsFromQuery: (data: D) => Fruit[]
    value?: Fruit | undefined
    onValueChange?: (value: Fruit | undefined) => void
}) =>
    render(
        <Combobox
            type="query"
            async={false}
            multiple={false}
            resettable={true}
            query={{
                queryKey: props.queryKey,
                queryFn: props.queryFn,
                select: props.getItemsFromQuery,
            }}
            value={props.value}
            onValueChange={props.onValueChange ?? noop}
            getItemId={fruit => fruit.id}
            getItemLabel={fruit => fruit.label}
            renderItem={({ item }) => <span>{item.label}</span>}
        />,
    )

/**
 * @description Renders a multiple combobox reading its items from the query
 * @template D Query data type
 * @param props Query settings and combobox overrides
 */
const renderQueryMultiCombobox = <D,>(props: {
    queryKey: unknown[]
    queryFn: () => Promise<D>
    getItemsFromQuery: (data: D) => Fruit[]
    value?: Fruit[]
    onValueChange?: (value: Fruit[]) => void
}) =>
    render(
        <Combobox
            type="query"
            async={false}
            multiple={true}
            resettable={true}
            query={{
                queryKey: props.queryKey,
                queryFn: props.queryFn,
                select: props.getItemsFromQuery,
            }}
            value={props.value ?? []}
            onValueChange={props.onValueChange ?? noop}
            getItemId={fruit => fruit.id}
            getItemLabel={fruit => fruit.label}
            renderItem={({ item }) => <span>{item.label}</span>}
        />,
    )

describe("Query Single Combobox", () => {
    it("disables trigger while query is loading", () => {
        renderQuerySingleCombobox({
            queryKey: ["query-single-loading"],
            queryFn: () => pendingPromise<Fruit[]>(),
            getItemsFromQuery: data => data,
        })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("renders options from query data once resolved", async () => {
        const user = userEvent.setup()
        renderQuerySingleCombobox({
            queryKey: ["query-single-resolved"],
            queryFn: () => Promise.resolve(fruits),
            getItemsFromQuery: data => data,
        })

        await waitFor(() => {
            expect(screen.getByRole("combobox")).not.toBeDisabled()
        })
        await user.click(screen.getByRole("combobox"))

        expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Cherry" })).toBeInTheDocument()
    })

    it("transforms query data via getItemsFromQuery", async () => {
        const user = userEvent.setup()
        renderQuerySingleCombobox({
            queryKey: ["query-single-transform"],
            queryFn: () => Promise.resolve({ items: fruits }),
            getItemsFromQuery: data => data.items,
        })

        await waitFor(() => {
            expect(screen.getByRole("combobox")).not.toBeDisabled()
        })
        await user.click(screen.getByRole("combobox"))

        expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument()
    })

    it("calls queryFn with the provided queryKey", async () => {
        const queryFn = vi.fn<() => Promise<Fruit[]>>(() => Promise.resolve(fruits))
        renderQuerySingleCombobox({
            queryKey: ["query-single-fn"],
            queryFn,
            getItemsFromQuery: data => data,
        })

        await waitFor(() => {
            expect(queryFn).toHaveBeenCalledWith(
                expect.objectContaining({ queryKey: ["query-single-fn"] }),
            )
        })
    })

    it("calls onValueChange when an option is selected", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit | undefined) => void>()
        renderQuerySingleCombobox({
            queryKey: ["query-single-select"],
            queryFn: () => Promise.resolve(fruits),
            getItemsFromQuery: data => data,
            onValueChange: handleValueChange,
        })

        await waitFor(() => {
            expect(screen.getByRole("combobox")).not.toBeDisabled()
        })
        await user.click(screen.getByRole("combobox"))
        await user.click(await screen.findByRole("option", { name: "Banana" }))

        expect(handleValueChange).toHaveBeenCalledWith(banana)
    })

    it("displays the selected value in the trigger", async () => {
        renderQuerySingleCombobox({
            queryKey: ["query-single-value"],
            queryFn: () => Promise.resolve(fruits),
            getItemsFromQuery: data => data,
            value: apple,
        })

        await waitFor(() => {
            expect(screen.getByRole("combobox")).not.toBeDisabled()
        })
        expect(screen.getByText("Apple")).toBeInTheDocument()
    })
})

describe("Query Multiple Combobox", () => {
    it("disables trigger while query is loading", () => {
        renderQueryMultiCombobox({
            queryKey: ["query-multi-loading"],
            queryFn: () => pendingPromise<Fruit[]>(),
            getItemsFromQuery: data => data,
        })

        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("renders options from query data once resolved", async () => {
        const user = userEvent.setup()
        renderQueryMultiCombobox({
            queryKey: ["query-multi-resolved"],
            queryFn: () => Promise.resolve(fruits),
            getItemsFromQuery: data => data,
        })

        await waitFor(() => {
            expect(screen.getByRole("combobox")).not.toBeDisabled()
        })
        await user.click(screen.getByRole("combobox"))

        expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument()
    })

    it("transforms query data via getItemsFromQuery", async () => {
        const user = userEvent.setup()
        renderQueryMultiCombobox({
            queryKey: ["query-multi-transform"],
            queryFn: () => Promise.resolve({ items: fruits }),
            getItemsFromQuery: data => data.items,
        })

        await waitFor(() => {
            expect(screen.getByRole("combobox")).not.toBeDisabled()
        })
        await user.click(screen.getByRole("combobox"))

        expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument()
    })

    it("calls onValueChange when an option is selected", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit[]) => void>()
        renderQueryMultiCombobox({
            queryKey: ["query-multi-select"],
            queryFn: () => Promise.resolve(fruits),
            getItemsFromQuery: data => data,
            onValueChange: handleValueChange,
        })

        await waitFor(() => {
            expect(screen.getByRole("combobox")).not.toBeDisabled()
        })
        await user.click(screen.getByRole("combobox"))
        await user.click(await screen.findByRole("option", { name: "Apple" }))

        expect(handleValueChange).toHaveBeenCalledWith([apple])
    })

    it("displays chips for selected values in the trigger", async () => {
        renderQueryMultiCombobox({
            queryKey: ["query-multi-chips"],
            queryFn: () => Promise.resolve(fruits),
            getItemsFromQuery: data => data,
            value: [apple, banana],
        })

        await waitFor(() => {
            expect(screen.getByRole("combobox")).not.toBeDisabled()
        })
        expect(screen.getByText("Apple")).toBeInTheDocument()
        expect(screen.getByText("Banana")).toBeInTheDocument()
    })
})

describe("Async Query Single Combobox", () => {
    it("shows search prompt when minimumSearchLength is 1 and search is empty", async () => {
        const user = userEvent.setup()
        render(
            <Combobox<Fruit>
                type="query"
                async={true}
                multiple={false}
                resettable={true}
                minimumSearchLength={1}
                query={search => ({
                    queryKey: ["async-query-single-prompt-1", search],
                    queryFn: () => Promise.resolve(fruits),
                    select: identity,
                })}
                value={undefined}
                onValueChange={noop}
                getItemId={fruit => fruit.id}
                getItemLabel={fruit => fruit.label}
                renderItem={({ item }) => <span>{item.label}</span>}
            />,
        )

        await user.click(screen.getByRole("combobox"))

        expect(
            await screen.findByText(
                t("Combobox.Search.Prompt.NoMinimumLength", undefined),
            ),
        ).toBeInTheDocument()
    })

    it("shows search prompt with length when minimumSearchLength is greater than 1", async () => {
        const user = userEvent.setup()
        render(
            <Combobox<Fruit>
                type="query"
                async={true}
                multiple={false}
                resettable={true}
                minimumSearchLength={3}
                query={search => ({
                    queryKey: ["async-query-single-prompt-3", search],
                    queryFn: () => Promise.resolve(fruits),
                    select: identity,
                })}
                value={undefined}
                onValueChange={noop}
                getItemId={fruit => fruit.id}
                getItemLabel={fruit => fruit.label}
                renderItem={({ item }) => <span>{item.label}</span>}
            />,
        )

        await user.click(screen.getByRole("combobox"))

        expect(
            await screen.findByText(
                t("Combobox.Search.Prompt.MinimumLength", { minLength: 3 }),
            ),
        ).toBeInTheDocument()
    })

    it("builds the query with the internally managed search", async () => {
        const user = userEvent.setup()
        const buildQuery = vi.fn<
            (search: string | undefined) => {
                queryKey: unknown[]
                queryFn: () => Promise<Fruit[]>
                select: (data: Fruit[]) => Fruit[]
            }
        >(search => ({
            queryKey: ["async-query-single-build", search],
            queryFn: () => Promise.resolve(fruits),
            select: identity,
        }))
        render(
            <Combobox
                type="query"
                async={true}
                multiple={false}
                resettable={true}
                minimumSearchLength={1}
                query={buildQuery}
                value={undefined}
                onValueChange={noop}
                getItemId={fruit => fruit.id}
                getItemLabel={fruit => fruit.label}
                renderItem={({ item }) => <span>{item.label}</span>}
            />,
        )

        await user.click(screen.getByRole("combobox"))
        await user.type(
            await screen.findByPlaceholderText(
                t("Combobox.Search.Placeholder", undefined),
            ),
            "a",
        )

        await waitFor(() => {
            expect(buildQuery).toHaveBeenCalledWith("a")
        })
    })

    it("shows options once search satisfies minimumSearchLength", async () => {
        const user = userEvent.setup()
        render(
            <Combobox<Fruit>
                type="query"
                async={true}
                multiple={false}
                resettable={true}
                minimumSearchLength={1}
                query={search => ({
                    queryKey: ["async-query-single-options", search],
                    queryFn: () => Promise.resolve(fruits),
                    select: identity,
                })}
                value={undefined}
                onValueChange={noop}
                getItemId={fruit => fruit.id}
                getItemLabel={fruit => fruit.label}
                renderItem={({ item }) => <span>{item.label}</span>}
            />,
        )

        await user.click(screen.getByRole("combobox"))
        await user.type(
            await screen.findByPlaceholderText(
                t("Combobox.Search.Placeholder", undefined),
            ),
            "a",
        )

        expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument()
    })

    it("calls onValueChange when an option is selected", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit | undefined) => void>()
        render(
            <Combobox<Fruit>
                type="query"
                async={true}
                multiple={false}
                resettable={true}
                minimumSearchLength={1}
                query={search => ({
                    queryKey: ["async-query-single-select", search],
                    queryFn: () => Promise.resolve(fruits),
                    select: identity,
                })}
                value={undefined}
                onValueChange={handleValueChange}
                getItemId={fruit => fruit.id}
                getItemLabel={fruit => fruit.label}
                renderItem={({ item }) => <span>{item.label}</span>}
            />,
        )

        await user.click(screen.getByRole("combobox"))
        await user.type(
            await screen.findByPlaceholderText(
                t("Combobox.Search.Placeholder", undefined),
            ),
            "b",
        )
        await user.click(await screen.findByRole("option", { name: "Banana" }))

        expect(handleValueChange).toHaveBeenCalledWith(banana)
    })

    it("transforms query data via select", async () => {
        const user = userEvent.setup()
        render(
            <Combobox<Fruit, { items: Fruit[] }>
                type="query"
                async={true}
                multiple={false}
                resettable={true}
                minimumSearchLength={1}
                query={search => ({
                    queryKey: ["async-query-single-transform", search],
                    queryFn: () => Promise.resolve({ items: fruits }),
                    select: data => data.items,
                })}
                value={undefined}
                onValueChange={noop}
                getItemId={fruit => fruit.id}
                getItemLabel={fruit => fruit.label}
                renderItem={({ item }) => <span>{item.label}</span>}
            />,
        )

        await user.click(screen.getByRole("combobox"))
        await user.type(
            await screen.findByPlaceholderText(
                t("Combobox.Search.Placeholder", undefined),
            ),
            "a",
        )

        expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument()
    })
})

describe("Async Query Multiple Combobox", () => {
    it("shows search prompt when minimumSearchLength is 1 and search is empty", async () => {
        const user = userEvent.setup()
        render(
            <Combobox<Fruit>
                type="query"
                async={true}
                multiple={true}
                resettable={true}
                minimumSearchLength={1}
                query={search => ({
                    queryKey: ["async-query-multi-prompt-1", search],
                    queryFn: () => Promise.resolve(fruits),
                    select: identity,
                })}
                value={[]}
                onValueChange={noop}
                getItemId={fruit => fruit.id}
                getItemLabel={fruit => fruit.label}
                renderItem={({ item }) => <span>{item.label}</span>}
            />,
        )

        await user.click(screen.getByRole("combobox"))

        expect(
            await screen.findByText(
                t("Combobox.Search.Prompt.NoMinimumLength", undefined),
            ),
        ).toBeInTheDocument()
    })

    it("shows options once search satisfies minimumSearchLength", async () => {
        const user = userEvent.setup()
        render(
            <Combobox<Fruit>
                type="query"
                async={true}
                multiple={true}
                resettable={true}
                minimumSearchLength={1}
                query={search => ({
                    queryKey: ["async-query-multi-options", search],
                    queryFn: () => Promise.resolve(fruits),
                    select: identity,
                })}
                value={[]}
                onValueChange={noop}
                getItemId={fruit => fruit.id}
                getItemLabel={fruit => fruit.label}
                renderItem={({ item }) => <span>{item.label}</span>}
            />,
        )

        await user.click(screen.getByRole("combobox"))
        await user.type(
            await screen.findByPlaceholderText(
                t("Combobox.Search.Placeholder", undefined),
            ),
            "c",
        )

        expect(await screen.findByRole("option", { name: "Cherry" })).toBeInTheDocument()
    })

    it("calls onValueChange when an option is selected", async () => {
        const user = userEvent.setup()
        const handleValueChange = vi.fn<(value: Fruit[]) => void>()
        render(
            <Combobox<Fruit>
                type="query"
                async={true}
                multiple={true}
                resettable={true}
                minimumSearchLength={1}
                query={search => ({
                    queryKey: ["async-query-multi-select", search],
                    queryFn: () => Promise.resolve(fruits),
                    select: identity,
                })}
                value={[]}
                onValueChange={handleValueChange}
                getItemId={fruit => fruit.id}
                getItemLabel={fruit => fruit.label}
                renderItem={({ item }) => <span>{item.label}</span>}
            />,
        )

        await user.click(screen.getByRole("combobox"))
        await user.type(
            await screen.findByPlaceholderText(
                t("Combobox.Search.Placeholder", undefined),
            ),
            "a",
        )
        await user.click(await screen.findByRole("option", { name: "Apple" }))

        expect(handleValueChange).toHaveBeenCalledWith([apple])
    })

    it("transforms query data via select", async () => {
        const user = userEvent.setup()
        render(
            <Combobox<Fruit, { items: Fruit[] }>
                type="query"
                async={true}
                multiple={true}
                resettable={true}
                minimumSearchLength={1}
                query={search => ({
                    queryKey: ["async-query-multi-transform", search],
                    queryFn: () => Promise.resolve({ items: fruits }),
                    select: data => data.items,
                })}
                value={[]}
                onValueChange={noop}
                getItemId={fruit => fruit.id}
                getItemLabel={fruit => fruit.label}
                renderItem={({ item }) => <span>{item.label}</span>}
            />,
        )

        await user.click(screen.getByRole("combobox"))
        await user.type(
            await screen.findByPlaceholderText(
                t("Combobox.Search.Placeholder", undefined),
            ),
            "a",
        )

        expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument()
    })
})

const HookedFruitItem = (props: { item: Fruit }) => {
    // SAFETY: this is a test file
    // oxlint-disable-next-line react/hook-use-state
    const [label] = useState(props.item.label)
    return <span>{label}</span>
}

describe("Combobox item component using hooks", () => {
    it("renders chips without hook errors when more values get selected", () => {
        const combobox = (value: Fruit[]) => (
            <Combobox
                type="standard"
                async={false}
                multiple={true}
                resettable={true}
                items={fruits}
                value={value}
                onValueChange={noop}
                getItemId={fruit => fruit.id}
                getItemLabel={fruit => fruit.label}
                renderItem={HookedFruitItem}
            />
        )

        const { rerender } = render(combobox([apple]))

        expect(() => {
            rerender(combobox([apple, banana]))
        }).not.toThrow()
    })
})

describe("Non-searchable Combobox", () => {
    const ControlledSingle = (props: { value?: Fruit }) => {
        const [value, setValue] = useState<Fruit | undefined>(props.value ?? apple)
        return (
            <Combobox
                type="standard"
                async={false}
                multiple={false}
                resettable={true}
                searchable={false}
                items={fruits}
                value={value}
                onValueChange={next => {
                    if (next !== undefined) {
                        setValue(next)
                    }
                }}
                getItemId={fruit => fruit.id}
                getItemLabel={fruit => fruit.label}
                renderItem={({ item }) => <span>{item.label}</span>}
            />
        )
    }

    const ControlledMultiple = () => {
        const [value, setValue] = useState<Fruit[]>([apple])
        return (
            <Combobox
                type="standard"
                async={false}
                multiple={true}
                resettable={true}
                searchable={false}
                items={fruits}
                value={value}
                onValueChange={setValue}
                getItemId={fruit => fruit.id}
                getItemLabel={fruit => fruit.label}
                renderItem={({ item }) => <span>{item.label}</span>}
            />
        )
    }

    /**
     * @description Returns the named option after the popup focus tracks it as active descendant
     * @param name Accessible name of the option
     * @remarks Required before every arrow key, because the option render alone does not mean focus moved into the popup
     */
    const waitForHighlightedOption = async (name: string) => {
        const option = await screen.findByRole("option", { name })
        await waitFor(() => {
            expect(document.activeElement).toHaveAttribute(
                "aria-activedescendant",
                option.id,
            )
        })
        return option
    }

    it("single: still lists the selected item after picking a non-initial value", async () => {
        const user = userEvent.setup()
        render(<ControlledSingle />)

        await user.click(screen.getByRole("combobox"))
        await user.click(await screen.findByRole("option", { name: "Banana" }))

        await user.click(screen.getByRole("combobox"))
        expect(await screen.findByRole("option", { name: "Banana" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Cherry" })).toBeInTheDocument()
    })

    it("single: selects the next item with ArrowDown and Enter", async () => {
        const user = userEvent.setup()
        render(<ControlledSingle />)

        await user.tab()
        await user.keyboard("{ArrowDown}")
        await waitForHighlightedOption("Apple")
        await user.keyboard("{ArrowDown}")
        await waitForHighlightedOption("Banana")
        await user.keyboard("{Enter}")

        expect(screen.getByRole("combobox")).toHaveTextContent("Banana")
    })

    it("single: selects the previous item with ArrowUp and Enter", async () => {
        const user = userEvent.setup()
        render(<ControlledSingle value={cherry} />)

        await user.tab()
        await user.keyboard("{ArrowDown}")
        await waitForHighlightedOption("Cherry")
        await user.keyboard("{ArrowUp}")
        await waitForHighlightedOption("Banana")
        await user.keyboard("{Enter}")

        expect(screen.getByRole("combobox")).toHaveTextContent("Banana")
    })

    it("multiple: selects the highlighted item with ArrowDown and Enter", async () => {
        const user = userEvent.setup()
        render(<ControlledMultiple />)

        await user.tab()
        await user.keyboard("{ArrowDown}")
        await waitForHighlightedOption("Apple")
        await user.keyboard("{ArrowDown}")
        await waitForHighlightedOption("Banana")
        await user.keyboard("{Enter}")

        expect(screen.getByRole("option", { name: "Banana" })).toHaveAttribute(
            "aria-selected",
            "true",
        )
    })

    it("multiple: still lists all items after picking a non-initial value", async () => {
        const user = userEvent.setup()
        render(<ControlledMultiple />)

        await user.click(screen.getByRole("combobox"))
        await user.click(await screen.findByRole("option", { name: "Banana" }))

        await user.keyboard("{Escape}")
        await waitFor(() => {
            expect(screen.queryByRole("option")).not.toBeInTheDocument()
        })

        await user.click(screen.getByRole("combobox"))
        expect(await screen.findByRole("option", { name: "Banana" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Cherry" })).toBeInTheDocument()
    })
})

describe("Combobox field callbacks", () => {
    it("records the change on selection and the blur on close", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Combobox
                    type="standard"
                    async={false}
                    multiple={true}
                    resettable={true}
                    items={fruits}
                    value={[]}
                    onValueChange={noop}
                    getItemId={fruit => fruit.id}
                    getItemLabel={fruit => fruit.label}
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
                <Combobox
                    type="standard"
                    async={false}
                    multiple={false}
                    resettable={true}
                    items={fruits}
                    value={apple}
                    onValueChange={noop}
                    getItemId={fruit => fruit.id}
                    getItemLabel={fruit => fruit.label}
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
                <Combobox
                    type="standard"
                    async={false}
                    multiple={false}
                    resettable={true}
                    items={fruits}
                    value={apple}
                    onValueChange={noop}
                    getItemId={fruit => fruit.id}
                    getItemLabel={fruit => fruit.label}
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
