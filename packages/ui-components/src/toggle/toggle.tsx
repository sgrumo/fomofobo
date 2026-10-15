import {
    Toggle as TogglePrimitive,
    ToggleGroup as ToggleGroupPrimitive,
} from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps, ReactNode } from "react"
import type { StrictOmit } from "shared/types"
import { isDefined } from "shared/values"
import { z } from "zod"
import type { ZodType } from "zod"

import {
    useFieldCallbacks,
    useFieldContext,
    useFieldInputMode,
} from "../field/field.context"
import { SelectionIndicator } from "../selection-indicator/selection-indicator"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import type { SwitchableModeClassName } from "../styling/styling.helper"
import {
    toggleGroupViewItemStyles,
    toggleGroupViewLabelStyles,
    toggleGroupViewStyles,
} from "./toggle.styles"

interface ToggleProps extends StrictOmit<
    ComponentProps<typeof TogglePrimitive>,
    "className"
> {
    viewModeSelectionIndicatorSize?: "sm" | "md"
    suppressFieldCallbacks?: boolean
    className?: SwitchableModeClassName<typeof TogglePrimitive>
}
export const Toggle = ({
    disabled: propDisabled,
    "aria-describedby": propAriaDescribedBy,
    suppressFieldCallbacks,
    onPressedChange: propOnPressedChange,
    onBlur: propOnBlur,
    className: propClassName,
    viewModeSelectionIndicatorSize,
    ...props
}: ToggleProps) => {
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)

    const disabled = propDisabled ?? fieldContext?.disabled
    const ariaLabelledBy = fieldContext?.labelId
    const ariaDescribedBy = propAriaDescribedBy ?? fieldContext?.describedByIds

    if (mode === "view") {
        return (
            <SelectionIndicator
                selected={props.pressed ?? props.defaultPressed ?? false}
                size={viewModeSelectionIndicatorSize}
                className={cn(normalizeBaseUiStyling(propClassName, { mode: "view" }))}
            />
        )
    }

    const onPressedChange: NonNullable<ToggleProps["onPressedChange"]> = (
        pressed,
        eventDetails,
    ) => {
        propOnPressedChange?.(pressed, eventDetails)
        callbacks.onChange()
    }

    const onBlur: NonNullable<ToggleProps["onBlur"]> = event => {
        propOnBlur?.(event)
        callbacks.onBlur(event)
    }

    return (
        <TogglePrimitive
            disabled={disabled}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            onPressedChange={onPressedChange}
            onBlur={onBlur}
            className={state =>
                cn(normalizeBaseUiStyling(propClassName, { mode: "edit", state }))
            }
            {...props}
        />
    )
}

interface BaseToggleGroupProps<T extends string> extends StrictOmit<
    ComponentProps<typeof ToggleGroupPrimitive<T>>,
    "value" | "onValueChange" | "defaultValue" | "children" | "multiple" | "className"
> {
    itemSchema: ZodType<T>
    items: T[]
    getItemLabel: (item: T) => string
    renderItem: (props: { item: T; toggled: boolean }) => ReactNode
    viewModeSelectionIndicatorSize?: "sm" | "md"
    suppressFieldCallbacks?: boolean
    className?: SwitchableModeClassName<typeof ToggleGroupPrimitive<T>>
}

export interface SingleToggleGroupProps<
    T extends string,
> extends BaseToggleGroupProps<T> {
    multiple: false
    value: T | undefined
    onValueChange: (value: T | undefined) => void
}

export interface MultipleToggleGroupProps<
    T extends string,
> extends BaseToggleGroupProps<T> {
    multiple: true
    value: T[]
    onValueChange: (value: T[]) => void
}

export type ToggleGroupProps<T extends string> =
    | SingleToggleGroupProps<T>
    | MultipleToggleGroupProps<T>

const SingleToggleGroup = <T extends string>({
    itemSchema,
    items,
    getItemLabel,
    renderItem: ItemComponent,
    value: propValue,
    onValueChange: propOnValueChange,
    disabled: propDisabled,
    "aria-describedby": propAriaDescribedBy,
    viewModeSelectionIndicatorSize,
    multiple,
    suppressFieldCallbacks,
    onBlur: propOnBlur,
    className: propClassName,
    ...props
}: SingleToggleGroupProps<T>) => {
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)

    const value = isDefined(propValue) ? [propValue] : []
    const disabled = propDisabled ?? fieldContext?.disabled
    const ariaLabelledBy = fieldContext?.labelId
    const ariaDescribedBy = propAriaDescribedBy ?? fieldContext?.describedByIds

    if (mode === "view") {
        return (
            <div
                role="group"
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                className={cn(
                    toggleGroupViewStyles(),
                    normalizeBaseUiStyling(propClassName, { mode: "view" }),
                )}
            >
                {items.map(item => (
                    <div key={item} className={toggleGroupViewItemStyles()}>
                        <SelectionIndicator
                            selected={propValue === item}
                            size={viewModeSelectionIndicatorSize}
                        />
                        <span className={toggleGroupViewLabelStyles()}>
                            {getItemLabel(item)}
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    const itemArraySchema = z.array(itemSchema)
    const onValueChange = (newValue: unknown) => {
        const parsed = itemArraySchema.safeParse(newValue)
        if (!parsed.success) {
            return
        }

        propOnValueChange(parsed.data[0])
        callbacks.onChange()
    }

    const onBlur: NonNullable<SingleToggleGroupProps<T>["onBlur"]> = event => {
        propOnBlur?.(event)
        callbacks.onBlur(event)
    }

    return (
        <ToggleGroupPrimitive
            value={value}
            onValueChange={onValueChange}
            multiple={multiple}
            disabled={disabled}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            onBlur={onBlur}
            className={state =>
                cn(normalizeBaseUiStyling(propClassName, { mode: "edit", state }))
            }
            {...props}
        >
            {items.map(item => (
                <TogglePrimitive key={item} value={item} aria-label={getItemLabel(item)}>
                    <ItemComponent item={item} toggled={propValue === item} />
                </TogglePrimitive>
            ))}
        </ToggleGroupPrimitive>
    )
}

const MultipleToggleGroup = <T extends string>({
    itemSchema,
    items,
    getItemLabel,
    renderItem: ItemComponent,
    value: propValue,
    onValueChange: propOnValueChange,
    disabled: propDisabled,
    "aria-describedby": propAriaDescribedBy,
    viewModeSelectionIndicatorSize,
    multiple,
    suppressFieldCallbacks,
    onBlur: propOnBlur,
    className: propClassName,
    ...props
}: MultipleToggleGroupProps<T>) => {
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)

    const disabled = propDisabled ?? fieldContext?.disabled
    const ariaLabelledBy = fieldContext?.labelId
    const ariaDescribedBy = propAriaDescribedBy ?? fieldContext?.describedByIds

    if (mode === "view") {
        return (
            <div
                role="group"
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                className={cn(
                    toggleGroupViewStyles(),
                    normalizeBaseUiStyling(propClassName, { mode: "view" }),
                )}
            >
                {items.map(item => (
                    <div key={item} className={toggleGroupViewItemStyles()}>
                        <SelectionIndicator
                            selected={propValue.includes(item)}
                            size={viewModeSelectionIndicatorSize}
                        />
                        <span className={toggleGroupViewLabelStyles()}>
                            {getItemLabel(item)}
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    const itemArraySchema = z.array(itemSchema)
    const onValueChange = (newValue: unknown) => {
        const parsed = itemArraySchema.safeParse(newValue)
        if (!parsed.success) {
            return
        }

        propOnValueChange(parsed.data)
        callbacks.onChange()
    }

    const onBlur: NonNullable<MultipleToggleGroupProps<T>["onBlur"]> = event => {
        propOnBlur?.(event)
        callbacks.onBlur(event)
    }

    return (
        <ToggleGroupPrimitive
            value={propValue}
            onValueChange={onValueChange}
            multiple={multiple}
            disabled={disabled}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            onBlur={onBlur}
            className={state =>
                cn(normalizeBaseUiStyling(propClassName, { mode: "edit", state }))
            }
            {...props}
        >
            {items.map(item => (
                <TogglePrimitive key={item} value={item} aria-label={getItemLabel(item)}>
                    <ItemComponent item={item} toggled={propValue.includes(item)} />
                </TogglePrimitive>
            ))}
        </ToggleGroupPrimitive>
    )
}

export const ToggleGroup = <T extends string>(props: ToggleGroupProps<T>) =>
    props.multiple ? <MultipleToggleGroup {...props} /> : <SingleToggleGroup {...props} />
