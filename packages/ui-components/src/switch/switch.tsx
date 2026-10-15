import type { HTMLProps } from "@base-ui/react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"
import type { StrictOmit } from "shared/types"

import {
    useFieldCallbacks,
    useFieldContext,
    useFieldInputMode,
} from "../field/field.context"
import { SelectionIndicator } from "../selection-indicator/selection-indicator"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import type { SwitchableModeClassName } from "../styling/styling.helper"
import type { SwitchSize } from "./switch.helper"
import { switchRootStyles, switchThumbStyles } from "./switch.styles"

interface SwitchProps extends StrictOmit<
    ComponentProps<typeof SwitchPrimitive.Root>,
    "checked" | "onCheckedChange" | "nativeButton" | "render" | "value" | "className"
> {
    value: boolean
    onValueChange: NonNullable<
        ComponentProps<typeof SwitchPrimitive.Root>["onCheckedChange"]
    >
    size?: SwitchSize
    viewModeSelectionIndicatorSize?: "sm" | "md"
    suppressFieldCallbacks?: boolean
    className?: SwitchableModeClassName<typeof SwitchPrimitive.Root>
}
export const Switch = ({
    value,
    onValueChange: propOnValueChange,
    id: propId,
    disabled: propDisabled,
    required: propRequired,
    "aria-describedby": propAriaDescribedBy,
    suppressFieldCallbacks,
    onBlur: propOnBlur,
    className: propClassName,
    size = "sm",
    viewModeSelectionIndicatorSize,
    ...props
}: SwitchProps) => {
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)

    const id = propId ?? fieldContext?.inputId
    const disabled = propDisabled ?? fieldContext?.disabled
    const required = propRequired ?? fieldContext?.required
    const ariaDescribedBy = propAriaDescribedBy ?? fieldContext?.describedByIds

    if (mode === "view") {
        return (
            <SelectionIndicator
                selected={value}
                size={viewModeSelectionIndicatorSize}
                className={cn(normalizeBaseUiStyling(propClassName, { mode: "view" }))}
            />
        )
    }

    const render = (renderProps: HTMLProps) => <button type="button" {...renderProps} />

    const onValueChange: SwitchProps["onValueChange"] = (newValue, eventDetails) => {
        propOnValueChange(newValue, eventDetails)
        callbacks.onChange()
    }

    const onBlur: NonNullable<SwitchProps["onBlur"]> = event => {
        propOnBlur?.(event)
        callbacks.onBlur(event)
    }

    return (
        <SwitchPrimitive.Root
            id={id}
            checked={value}
            onCheckedChange={onValueChange}
            disabled={disabled}
            required={required}
            aria-describedby={ariaDescribedBy}
            onBlur={onBlur}
            render={render}
            nativeButton={true}
            className={state =>
                cn(
                    switchRootStyles({ checked: state.checked, size }),
                    normalizeBaseUiStyling(propClassName, { mode: "edit", state }),
                )
            }
            {...props}
        >
            <SwitchPrimitive.Thumb
                className={state => switchThumbStyles({ checked: state.checked, size })}
            />
        </SwitchPrimitive.Root>
    )
}
