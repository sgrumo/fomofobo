import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"
import type { StrictOmit } from "shared/types"

import {
    useFieldCallbacks,
    useFieldContext,
    useFieldInputMode,
} from "../field/field.context"
import { InputView } from "../input/input"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import type { SwitchableModeClassName } from "../styling/styling.helper"
import type { SliderSize } from "./slider.helper"
import {
    sliderControlStyles,
    sliderIndicatorStyles,
    sliderThumbStyles,
    sliderTrackStyles,
    sliderRootStyles,
} from "./slider.styles"

interface SliderProps extends StrictOmit<
    ComponentProps<typeof SliderPrimitive.Root>,
    "value" | "onValueChange" | "defaultValue" | "className"
> {
    value: number
    onValueChange: (value: number) => void
    size?: SliderSize
    suppressFieldCallbacks?: boolean
    className?: SwitchableModeClassName<typeof SliderPrimitive.Root>
}

export const Slider = ({
    value,
    onValueChange,
    disabled: propDisabled,
    "aria-describedby": propAriaDescribedBy,
    size = "sm",
    suppressFieldCallbacks,
    onBlur: propOnBlur,
    className: propClassName,
    ...props
}: SliderProps) => {
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)

    const disabled = propDisabled ?? fieldContext?.disabled
    const ariaDescribedBy = propAriaDescribedBy ?? fieldContext?.describedByIds

    if (mode === "view") {
        return (
            <InputView
                size={size}
                className={cn(normalizeBaseUiStyling(propClassName, { mode: "view" }))}
            >
                {value}
            </InputView>
        )
    }

    const handleValueChange = (newValue: number) => {
        onValueChange(newValue)
        callbacks.onChange()
    }

    const onBlur: NonNullable<SliderProps["onBlur"]> = event => {
        propOnBlur?.(event)
        callbacks.onBlur(event)
    }

    return (
        <SliderPrimitive.Root
            value={value}
            onValueChange={handleValueChange}
            disabled={disabled}
            onBlur={onBlur}
            className={state =>
                cn(
                    sliderRootStyles(),
                    normalizeBaseUiStyling(propClassName, { mode: "edit", state }),
                )
            }
            {...props}
        >
            <SliderPrimitive.Control className={sliderControlStyles({ size })}>
                <SliderPrimitive.Track className={sliderTrackStyles({ size })}>
                    <SliderPrimitive.Indicator className={sliderIndicatorStyles()} />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb
                    className={sliderThumbStyles({ size })}
                    aria-labelledby={fieldContext?.labelId}
                    aria-describedby={ariaDescribedBy}
                />
            </SliderPrimitive.Control>
        </SliderPrimitive.Root>
    )
}
