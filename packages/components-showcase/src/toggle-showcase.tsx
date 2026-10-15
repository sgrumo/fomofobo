import { cn } from "frontend-shared/styles"
import type { ReactNode } from "react"
import { useState } from "react"
import { Field } from "ui-components/field"
import {
    IconAlignCenter,
    IconAlignLeft,
    IconAlignRight,
    IconBold,
} from "ui-components/icons"
import { ButtonToggle, ButtonToggleGroup, ToggleGroup } from "ui-components/toggle"
import { z } from "zod"

interface ToggleShowcaseProps {
    className?: string
}
export const ToggleShowcase = (props: ToggleShowcaseProps) => (
    <div className={cn("flex flex-col gap-6", props.className)}>
        <p className="tp-pixel-lg">Button (standalone)</p>
        <ButtonToggleStandaloneShowcase />
        <p className="tp-pixel-lg">Button group (single)</p>
        <ButtonToggleGroupSingleShowcase />
        <p className="tp-pixel-lg">Button group (multiple)</p>
        <ButtonToggleGroupMultipleShowcase />
        <p className="tp-pixel-lg">Generic group (custom renderItem)</p>
        <GenericToggleGroupShowcase />
        <p className="tp-pixel-lg">Generic group (with description)</p>
        <DescribedToggleGroupShowcase />
    </div>
)

const ButtonToggleStandaloneShowcase = () => {
    const [pressed, setPressed] = useState(false)

    return (
        <Field label="Bold" srOnly={true} className="w-fit" required={false}>
            <ButtonToggle pressed={pressed} onPressedChange={setPressed}>
                <IconBold />
            </ButtonToggle>
        </Field>
    )
}

const alignmentSchema = z.enum(["left", "center", "right"])
type Alignment = z.infer<typeof alignmentSchema>

const alignmentIcons: Record<Alignment, ReactNode> = {
    left: <IconAlignLeft />,
    center: <IconAlignCenter />,
    right: <IconAlignRight />,
}
const alignmentLabels: Record<Alignment, string> = {
    left: "Align left",
    center: "Align center",
    right: "Align right",
}

const ButtonToggleGroupSingleShowcase = () => {
    const [value, setValue] = useState<Alignment | undefined>("left")

    return (
        <ButtonToggleGroup
            multiple={false}
            itemSchema={alignmentSchema}
            items={["left", "center", "right"]}
            getItemIcon={item => alignmentIcons[item]}
            getItemLabel={item => alignmentLabels[item]}
            value={value}
            onValueChange={setValue}
            className="w-fit"
        />
    )
}

const ButtonToggleGroupMultipleShowcase = () => {
    const [value, setValue] = useState<Alignment[]>(["left", "center"])

    return (
        <ButtonToggleGroup
            multiple={true}
            itemSchema={alignmentSchema}
            items={["left", "center", "right"]}
            getItemIcon={item => alignmentIcons[item]}
            getItemLabel={item => alignmentLabels[item]}
            value={value}
            onValueChange={setValue}
            className="w-fit"
        />
    )
}

const sizeSchema = z.enum(["s", "m", "l", "xl"])
type Size = z.infer<typeof sizeSchema>

const sizeLabels: Record<Size, string> = {
    s: "Small",
    m: "Medium",
    l: "Large",
    xl: "Extra large",
}

const DescribedToggleGroupShowcase = () => {
    const [value, setValue] = useState<Alignment | undefined>("left")

    return (
        <Field
            label="Text alignment"
            description="Choose how the paragraph text is aligned."
            required={false}
        >
            <ButtonToggleGroup
                multiple={false}
                itemSchema={alignmentSchema}
                items={["left", "center", "right"]}
                getItemIcon={item => alignmentIcons[item]}
                getItemLabel={item => alignmentLabels[item]}
                value={value}
                onValueChange={setValue}
                className="w-fit"
            />
        </Field>
    )
}

const GenericToggleGroupShowcase = () => {
    const [value, setValue] = useState<Size[]>(["m"])

    return (
        <ToggleGroup
            multiple={true}
            itemSchema={sizeSchema}
            items={["s", "m", "l", "xl"]}
            getItemLabel={item => sizeLabels[item]}
            value={value}
            onValueChange={setValue}
            className="flex w-fit items-center gap-2"
            renderItem={({ item, toggled }) => (
                <span
                    className={cn(
                        "tp-pixel-md rounded-full border px-3 py-1 transition-colors",
                        toggled
                            ? "border-line bg-surface-inverse text-fg-inverse"
                            : "border-line-muted bg-surface text-fg hover:bg-surface-muted",
                    )}
                >
                    {sizeLabels[item]}
                </span>
            )}
        />
    )
}
