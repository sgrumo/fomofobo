import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { z } from "zod"

import { Field } from "../field/field"
import { queryFieldError, submitFieldCallbacksForm } from "../test/field-callbacks"
import { FieldCallbacksForm } from "../test/field-callbacks-form"
import { render, screen } from "../test/test-utils"
import { Toggle, ToggleGroup } from "./toggle"

describe("Toggle", () => {
    it("renders with field label via aria-labelledby", () => {
        render(
            <Field required={false} label="Bold" srOnly={true}>
                <Toggle>
                    <svg data-testid="icon" />
                </Toggle>
            </Field>,
        )

        expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument()
        expect(screen.getByTestId("icon")).toBeInTheDocument()
    })

    it("toggles pressed state on click", async () => {
        const user = userEvent.setup()

        render(
            <Field required={false} label="Bold" srOnly={true}>
                <Toggle>
                    <svg />
                </Toggle>
            </Field>,
        )

        const button = screen.getByRole("button", { name: "Bold" })
        expect(button).not.toHaveAttribute("data-pressed")

        await user.click(button)

        expect(button).toHaveAttribute("data-pressed", "")
    })

    it("calls onPressedChange", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(pressed: boolean) => void>()

        render(
            <Field required={false} label="Bold" srOnly={true}>
                <Toggle onPressedChange={handleChange}>
                    <svg />
                </Toggle>
            </Field>,
        )

        await user.click(screen.getByRole("button", { name: "Bold" }))

        expect(handleChange).toHaveBeenCalledWith(true, expect.anything())
    })

    it("supports controlled pressed state", () => {
        render(
            <Field required={false} label="Bold" srOnly={true}>
                <Toggle pressed={true}>
                    <svg />
                </Toggle>
            </Field>,
        )

        expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute(
            "data-pressed",
            "",
        )
    })

    it("inherits disabled from field context", () => {
        render(
            <Field required={false} label="Bold" srOnly={true} disabled={true}>
                <Toggle>
                    <svg />
                </Toggle>
            </Field>,
        )

        expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled()
    })

    it("applies custom className", () => {
        render(
            <Field required={false} label="Bold" srOnly={true}>
                <Toggle className="custom-class">
                    <svg />
                </Toggle>
            </Field>,
        )

        expect(screen.getByRole("button", { name: "Bold" })).toHaveClass("custom-class")
    })
})

const itemSchema = z.enum(["a", "b", "c"])
type Item = z.infer<typeof itemSchema>

/**
 * @description Returns the display label of the item
 * @param item Item labeled
 */
const getItemLabel = (item: Item) => `Item ${item.toUpperCase()}`
const TestItem = ({ item, toggled }: { item: Item; toggled: boolean }) => (
    <span>{toggled ? `${item}-on` : `${item}-off`}</span>
)

describe("ToggleGroup (single)", () => {
    it("renders all items with aria-label from getItemLabel", () => {
        render(
            <ToggleGroup
                multiple={false}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemLabel={getItemLabel}
                renderItem={TestItem}
                value={undefined}
                onValueChange={noop}
            />,
        )

        expect(screen.getByRole("button", { name: "Item A" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Item B" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Item C" })).toBeInTheDocument()
    })

    it("passes toggled=true to renderItem for the current value", () => {
        render(
            <ToggleGroup
                multiple={false}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemLabel={getItemLabel}
                renderItem={TestItem}
                value="b"
                onValueChange={noop}
            />,
        )

        expect(screen.getByRole("button", { name: "Item A" })).toHaveTextContent("a-off")
        expect(screen.getByRole("button", { name: "Item B" })).toHaveTextContent("b-on")
        expect(screen.getByRole("button", { name: "Item C" })).toHaveTextContent("c-off")
    })

    it("reflects pressed state on the underlying button", () => {
        render(
            <ToggleGroup
                multiple={false}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemLabel={getItemLabel}
                renderItem={TestItem}
                value="b"
                onValueChange={noop}
            />,
        )

        expect(screen.getByRole("button", { name: "Item A" })).not.toHaveAttribute(
            "data-pressed",
        )
        expect(screen.getByRole("button", { name: "Item B" })).toHaveAttribute(
            "data-pressed",
            "",
        )
    })

    it("calls onValueChange when item is clicked", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: Item | undefined) => void>()

        render(
            <ToggleGroup
                multiple={false}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemLabel={getItemLabel}
                renderItem={TestItem}
                value={undefined}
                onValueChange={handleChange}
            />,
        )

        await user.click(screen.getByRole("button", { name: "Item A" }))

        expect(handleChange).toHaveBeenCalledWith("a")
    })

    it("calls onValueChange with undefined when pressed item is clicked", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: Item | undefined) => void>()

        render(
            <ToggleGroup
                multiple={false}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemLabel={getItemLabel}
                renderItem={TestItem}
                value="a"
                onValueChange={handleChange}
            />,
        )

        await user.click(screen.getByRole("button", { name: "Item A" }))

        expect(handleChange).toHaveBeenCalledWith(undefined)
    })
})

describe("ToggleGroup (multiple)", () => {
    it("passes toggled=true for every selected value", () => {
        render(
            <ToggleGroup
                multiple={true}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemLabel={getItemLabel}
                renderItem={TestItem}
                value={["a", "c"]}
                onValueChange={noop}
            />,
        )

        expect(screen.getByRole("button", { name: "Item A" })).toHaveTextContent("a-on")
        expect(screen.getByRole("button", { name: "Item B" })).toHaveTextContent("b-off")
        expect(screen.getByRole("button", { name: "Item C" })).toHaveTextContent("c-on")
    })

    it("calls onValueChange with added item", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: Item[]) => void>()

        render(
            <ToggleGroup
                multiple={true}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemLabel={getItemLabel}
                renderItem={TestItem}
                value={["a"]}
                onValueChange={handleChange}
            />,
        )

        await user.click(screen.getByRole("button", { name: "Item B" }))

        expect(handleChange).toHaveBeenCalledWith(["a", "b"])
    })

    it("calls onValueChange with removed item", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: Item[]) => void>()

        render(
            <ToggleGroup
                multiple={true}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemLabel={getItemLabel}
                renderItem={TestItem}
                value={["a", "b"]}
                onValueChange={handleChange}
            />,
        )

        await user.click(screen.getByRole("button", { name: "Item A" }))

        expect(handleChange).toHaveBeenCalledWith(["b"])
    })
})

const HookedItem = (props: { item: Item; toggled: boolean }) => {
    // SAFETY: this is a test file
    // oxlint-disable-next-line react/hook-use-state
    const [label] = useState(props.item)
    return <span>{props.toggled ? `${label}-on` : `${label}-off`}</span>
}

describe("ToggleGroup item component using hooks", () => {
    it("renders without hook errors when the items list shrinks", () => {
        const toggleGroup = (items: Item[]) => (
            <ToggleGroup
                multiple={false}
                itemSchema={itemSchema}
                items={items}
                getItemLabel={getItemLabel}
                renderItem={HookedItem}
                value={undefined}
                onValueChange={noop}
            />
        )

        const { rerender } = render(toggleGroup(["a", "b", "c"]))

        expect(() => {
            rerender(toggleGroup(["a", "b"]))
        }).not.toThrow()
    })
})

describe("Toggle field callbacks", () => {
    it("records the change and the blur on the field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Toggle>
                    <span>Bold</span>
                </Toggle>
            </FieldCallbacksForm>,
        )

        expect(queryFieldError()).not.toBeInTheDocument()

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Field" }))
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records nothing when the field callbacks are suppressed", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <Toggle suppressFieldCallbacks={true}>
                    <span>Bold</span>
                </Toggle>
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        await user.click(screen.getByRole("button", { name: "Field" }))

        expect(queryFieldError()).toBeInTheDocument()
    })
})

describe("ToggleGroup field callbacks", () => {
    it("records the change and the blur of a single group on the group field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <ToggleGroup
                    multiple={false}
                    itemSchema={itemSchema}
                    items={["a", "b", "c"]}
                    getItemLabel={getItemLabel}
                    renderItem={TestItem}
                    value={undefined}
                    onValueChange={noop}
                />
            </FieldCallbacksForm>,
        )

        expect(queryFieldError()).not.toBeInTheDocument()

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Item C" }))
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records the change and the blur of a multiple group on the group field", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <ToggleGroup
                    multiple={true}
                    itemSchema={itemSchema}
                    items={["a", "b", "c"]}
                    getItemLabel={getItemLabel}
                    renderItem={TestItem}
                    value={[]}
                    onValueChange={noop}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        expect(queryFieldError()).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Item C" }))
        expect(queryFieldError()).not.toBeInTheDocument()

        await user.tab()
        expect(queryFieldError()).toBeInTheDocument()
    })

    it("records nothing when the field callbacks are suppressed", async () => {
        const user = userEvent.setup()
        render(
            <FieldCallbacksForm>
                <ToggleGroup
                    multiple={false}
                    itemSchema={itemSchema}
                    items={["a", "b", "c"]}
                    getItemLabel={getItemLabel}
                    renderItem={TestItem}
                    value={undefined}
                    onValueChange={noop}
                    suppressFieldCallbacks={true}
                />
            </FieldCallbacksForm>,
        )

        await submitFieldCallbacksForm(user)
        await user.click(screen.getByRole("button", { name: "Item C" }))

        expect(queryFieldError()).toBeInTheDocument()
    })
})
