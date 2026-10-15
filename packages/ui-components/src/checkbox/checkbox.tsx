import { CheckboxGroup as CheckboxGroupRoot } from "@base-ui/react"
import type { HTMLProps } from "@base-ui/react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import type { CheckboxIndicatorState } from "@base-ui/react/checkbox"
import { identity } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"
import type { StrictOmit } from "shared/types"
import { match } from "ts-pattern"
import { z } from "zod"
import type { ZodType } from "zod"

import { Field } from "../field/field"
import {
    useFieldCallbacks,
    useFieldContext,
    useFieldInputMode,
} from "../field/field.context"
import { IconCheck, IconHorizontalLine } from "../icons/icons"
import { SelectionIndicator } from "../selection-indicator/selection-indicator"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import type { SwitchableModeClassName } from "../styling/styling.helper"
import type { CheckboxState } from "./checkbox.helper"
import {
    checkboxGroupViewStyles,
    checkboxIndicatorStyles,
    checkboxRootStyles,
} from "./checkbox.styles"

type CheckboxRootProps = StrictOmit<
    ComponentProps<typeof CheckboxPrimitive.Root>,
    "render" | "nativeButton"
>
const CheckboxRoot = ({ className: propClassName, ...props }: CheckboxRootProps) => {
    const render = (renderProps: HTMLProps) => <button type="button" {...renderProps} />

    return (
        <CheckboxPrimitive.Root
            className={state =>
                cn(
                    checkboxRootStyles({
                        checked: state.checked,
                        indeterminate: state.indeterminate,
                    }),
                    normalizeBaseUiStyling(propClassName, state),
                )
            }
            render={render}
            nativeButton={true}
            {...props}
        />
    )
}

const CheckboxIndicator = ({
    render: propRender,
    className: propClassName,
    ...props
}: ComponentProps<typeof CheckboxPrimitive.Indicator>) => {
    const render =
        propRender ??
        ((renderProps: HTMLProps, state: CheckboxIndicatorState) => (
            <span {...renderProps}>
                {state.indeterminate && <IconHorizontalLine />}
                {!state.indeterminate && <IconCheck />}
            </span>
        ))

    return (
        <CheckboxPrimitive.Indicator
            className={state =>
                cn(
                    checkboxIndicatorStyles(),
                    normalizeBaseUiStyling(propClassName, state),
                )
            }
            render={render}
            {...props}
        />
    )
}

interface CheckboxProps extends StrictOmit<
    ComponentProps<typeof CheckboxPrimitive.Root>,
    "value" | "checked" | "defaultChecked" | "indeterminate" | "className"
> {
    value: CheckboxState
    onValueChange: NonNullable<
        ComponentProps<typeof CheckboxPrimitive.Root>["onCheckedChange"]
    >
    viewModeSelectionIndicatorSize?: "sm" | "md"
    suppressFieldCallbacks?: boolean
    className?: SwitchableModeClassName<typeof CheckboxPrimitive.Root>
}
export const Checkbox = ({
    value: propValue,
    onValueChange: propOnValueChange,
    id: propId,
    disabled: propDisabled,
    required: propRequired,
    "aria-describedby": propAriaDescribedBy,
    viewModeSelectionIndicatorSize,
    suppressFieldCallbacks,
    onBlur: propOnBlur,
    className: propClassName,
    ...props
}: CheckboxProps) => {
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)

    const value = match(propValue)
        .returnType<boolean>()
        .with("indeterminate", () => false)
        .otherwise(identity)
    const indeterminate = propValue === "indeterminate"

    const id = propId ?? fieldContext?.inputId
    const disabled = propDisabled ?? fieldContext?.disabled
    const required = propRequired ?? fieldContext?.required
    const ariaDescribedBy = propAriaDescribedBy ?? fieldContext?.describedByIds

    if (mode === "view") {
        return (
            <SelectionIndicator
                selected={value}
                indeterminate={indeterminate}
                size={viewModeSelectionIndicatorSize}
                className={cn(normalizeBaseUiStyling(propClassName, { mode: "view" }))}
            />
        )
    }

    const onValueChange: CheckboxProps["onValueChange"] = (newValue, eventDetails) => {
        propOnValueChange(newValue, eventDetails)
        callbacks.onChange()
    }

    const onBlur: NonNullable<CheckboxProps["onBlur"]> = event => {
        propOnBlur?.(event)
        callbacks.onBlur(event)
    }

    return (
        <CheckboxRoot
            id={id}
            checked={value}
            indeterminate={indeterminate}
            onCheckedChange={onValueChange}
            disabled={disabled}
            required={required}
            aria-describedby={ariaDescribedBy}
            onBlur={onBlur}
            className={state =>
                cn(normalizeBaseUiStyling(propClassName, { mode: "edit", state }))
            }
            {...props}
        >
            <CheckboxIndicator />
        </CheckboxRoot>
    )
}

interface CheckboxGroupItemProps {
    value: string
}
const CheckboxGroupItem = (props: CheckboxGroupItemProps) => {
    const fieldContext = useFieldContext()

    const id = fieldContext?.inputId
    const disabled = fieldContext?.disabled
    const required = fieldContext?.required

    return (
        <CheckboxRoot id={id} value={props.value} disabled={disabled} required={required}>
            <CheckboxIndicator />
        </CheckboxRoot>
    )
}

interface CheckboxGroupProps<T extends string> extends StrictOmit<
    ComponentProps<typeof CheckboxGroupRoot>,
    "value" | "onValueChange" | "allValues" | "defaultValue" | "className"
> {
    itemSchema: ZodType<T>
    items: T[]
    getItemLabel: (option: T) => string
    value: T[]
    onValueChange: (value: T[]) => void
    viewModeSelectionIndicatorSize?: "sm" | "md"
    suppressFieldCallbacks?: boolean
    className?: SwitchableModeClassName<typeof CheckboxGroupRoot>
}
export const CheckboxGroup = <T extends string>({
    itemSchema,
    items,
    getItemLabel,
    value,
    onValueChange: propOnValueChange,
    disabled: propDisabled,
    "aria-labelledby": propAriaLabelledBy,
    "aria-describedby": propAriaDescribedBy,
    viewModeSelectionIndicatorSize,
    suppressFieldCallbacks,
    onChange: propOnChange,
    onBlur: propOnBlur,
    className: propClassName,
    ...props
}: CheckboxGroupProps<T>) => {
    const groupFieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)

    const disabled = propDisabled ?? groupFieldContext?.disabled
    const ariaLabelledBy = propAriaLabelledBy ?? groupFieldContext?.labelId
    const ariaDescribedBy = propAriaDescribedBy ?? groupFieldContext?.describedByIds

    if (mode === "view") {
        return (
            <div
                role="group"
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                className={cn(
                    checkboxGroupViewStyles(),
                    normalizeBaseUiStyling(propClassName, { mode: "view" }),
                )}
            >
                {items.map(option => (
                    <Field
                        key={option}
                        required={false}
                        label={getItemLabel(option)}
                        labelSide="right"
                        mode="view"
                    >
                        <SelectionIndicator
                            selected={value.includes(option)}
                            size={viewModeSelectionIndicatorSize}
                        />
                    </Field>
                ))}
            </div>
        )
    }

    const onValueChange = (newValue: string[]) => {
        const parsed = z.array(itemSchema).safeParse(newValue)
        if (!parsed.success) {
            return
        }

        propOnValueChange(parsed.data)
    }

    const onChange: NonNullable<CheckboxGroupProps<T>["onChange"]> = event => {
        propOnChange?.(event)
        callbacks.onChange()
    }

    const onBlur: NonNullable<CheckboxGroupProps<T>["onBlur"]> = event => {
        propOnBlur?.(event)
        callbacks.onBlur(event)
    }

    return (
        <CheckboxGroupRoot
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            onChange={onChange}
            onBlur={onBlur}
            className={state =>
                cn(normalizeBaseUiStyling(propClassName, { mode: "edit", state }))
            }
            {...props}
        >
            {items.map(option => (
                <Field
                    key={option}
                    required={false}
                    label={getItemLabel(option)}
                    labelSide="right"
                >
                    <CheckboxGroupItem value={option} />
                </Field>
            ))}
        </CheckboxGroupRoot>
    )
}
