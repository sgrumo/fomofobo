import { userEvent } from "@testing-library/user-event"
import { noop } from "es-toolkit"
import { describe, expect, it, vi } from "vitest"
import { z } from "zod"

import { Field } from "../field/field"
import { render, screen, within } from "../test/test-utils"
import { ButtonToggle, ButtonToggleGroup } from "./button-toggle"

describe("ButtonToggle", () => {
    it("renders with field label via aria-labelledby", () => {
        render(
            <Field required={false} label="Bold" srOnly={true}>
                <ButtonToggle>
                    <svg data-testid="icon" />
                </ButtonToggle>
            </Field>,
        )

        expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument()
        expect(screen.getByTestId("icon")).toBeInTheDocument()
    })

    it("toggles pressed state on click", async () => {
        const user = userEvent.setup()

        render(
            <Field required={false} label="Bold" srOnly={true}>
                <ButtonToggle>
                    <svg />
                </ButtonToggle>
            </Field>,
        )

        const button = screen.getByRole("button", { name: "Bold" })
        expect(button).not.toHaveAttribute("data-pressed")

        await user.click(button)

        expect(button).toHaveAttribute("data-pressed", "")
    })

    it("inherits disabled from field context", () => {
        render(
            <Field required={false} label="Bold" srOnly={true} disabled={true}>
                <ButtonToggle>
                    <svg />
                </ButtonToggle>
            </Field>,
        )

        expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled()
    })

    it("applies custom className", () => {
        render(
            <Field required={false} label="Bold" srOnly={true}>
                <ButtonToggle className="custom-class">
                    <svg />
                </ButtonToggle>
            </Field>,
        )

        expect(screen.getByRole("button", { name: "Bold" })).toHaveClass("custom-class")
    })
})

const itemSchema = z.enum(["a", "b", "c"])
type Item = z.infer<typeof itemSchema>

const getItemIcon = (item: Item) => <svg data-testid={`icon-${item}`} />
/**
 * @description Returns the display label of the item
 * @param item Item labeled
 */
const getItemLabel = (item: Item) => `Item ${item.toUpperCase()}`

describe("ButtonToggleGroup (single)", () => {
    it("renders each item's icon inside its labeled button", () => {
        render(
            <ButtonToggleGroup
                multiple={false}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemIcon={getItemIcon}
                getItemLabel={getItemLabel}
                value={undefined}
                onValueChange={noop}
            />,
        )

        expect(
            within(screen.getByRole("button", { name: "Item A" })).getByTestId("icon-a"),
        ).toBeInTheDocument()
        expect(
            within(screen.getByRole("button", { name: "Item B" })).getByTestId("icon-b"),
        ).toBeInTheDocument()
        expect(
            within(screen.getByRole("button", { name: "Item C" })).getByTestId("icon-c"),
        ).toBeInTheDocument()
    })

    it("shows pressed state for current value", () => {
        render(
            <ButtonToggleGroup
                multiple={false}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemIcon={getItemIcon}
                getItemLabel={getItemLabel}
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
            <ButtonToggleGroup
                multiple={false}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemIcon={getItemIcon}
                getItemLabel={getItemLabel}
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
            <ButtonToggleGroup
                multiple={false}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemIcon={getItemIcon}
                getItemLabel={getItemLabel}
                value="a"
                onValueChange={handleChange}
            />,
        )

        await user.click(screen.getByRole("button", { name: "Item A" }))

        expect(handleChange).toHaveBeenCalledWith(undefined)
    })
})

describe("ButtonToggleGroup (multiple)", () => {
    it("renders each item's icon inside its labeled button", () => {
        render(
            <ButtonToggleGroup
                multiple={true}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemIcon={getItemIcon}
                getItemLabel={getItemLabel}
                value={[]}
                onValueChange={noop}
            />,
        )

        expect(
            within(screen.getByRole("button", { name: "Item A" })).getByTestId("icon-a"),
        ).toBeInTheDocument()
        expect(
            within(screen.getByRole("button", { name: "Item B" })).getByTestId("icon-b"),
        ).toBeInTheDocument()
        expect(
            within(screen.getByRole("button", { name: "Item C" })).getByTestId("icon-c"),
        ).toBeInTheDocument()
    })

    it("shows pressed state for all selected values", () => {
        render(
            <ButtonToggleGroup
                multiple={true}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemIcon={getItemIcon}
                getItemLabel={getItemLabel}
                value={["a", "c"]}
                onValueChange={noop}
            />,
        )

        expect(screen.getByRole("button", { name: "Item A" })).toHaveAttribute(
            "data-pressed",
            "",
        )
        expect(screen.getByRole("button", { name: "Item B" })).not.toHaveAttribute(
            "data-pressed",
        )
        expect(screen.getByRole("button", { name: "Item C" })).toHaveAttribute(
            "data-pressed",
            "",
        )
    })

    it("calls onValueChange with added item", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn<(value: Item[]) => void>()

        render(
            <ButtonToggleGroup
                multiple={true}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemIcon={getItemIcon}
                getItemLabel={getItemLabel}
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
            <ButtonToggleGroup
                multiple={true}
                itemSchema={itemSchema}
                items={["a", "b", "c"]}
                getItemIcon={getItemIcon}
                getItemLabel={getItemLabel}
                value={["a", "b"]}
                onValueChange={handleChange}
            />,
        )

        await user.click(screen.getByRole("button", { name: "Item A" }))

        expect(handleChange).toHaveBeenCalledWith(["b"])
    })
})
