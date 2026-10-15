import type { HTMLProps } from "@base-ui/react"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupRoot } from "@base-ui/react/radio-group"
import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"
import type { StrictOmit } from "shared/types"
import { isDefined } from "shared/values"
import type { ZodType } from "zod"

import { Field } from "../field/field"
import {
    useFieldCallbacks,
    useFieldContext,
    useFieldInputMode,
} from "../field/field.context"
import { InputView } from "../input/input"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import type { SwitchableModeClassName } from "../styling/styling.helper"
import type { RadioSize } from "./radio.helper"
import { radioIndicatorStyles, radioRootStyles } from "./radio.styles"

type RadioRootProps = StrictOmit<
    ComponentProps<typeof RadioPrimitive.Root>,
    "nativeButton" | "render"
> & {
    size?: RadioSize
}
export const RadioRoot = ({
    className: propClassName,
    size = "sm",
    ...props
}: RadioRootProps) => {
    const render = (renderProps: HTMLProps) => <button type="button" {...renderProps} />

    return (
        <RadioPrimitive.Root
            className={state =>
                cn(
                    radioRootStyles({ checked: state.checked, size }),
                    normalizeBaseUiStyling(propClassName, state),
                )
            }
            render={render}
            nativeButton={true}
            {...props}
        />
    )
}

type RadioIndicatorProps = ComponentProps<typeof RadioPrimitive.Indicator> & {
    size?: RadioSize
}
export const RadioIndicator = ({
    className: propClassName,
    size = "sm",
    ...props
}: RadioIndicatorProps) => (
    <RadioPrimitive.Indicator
        className={state =>
            cn(
                radioIndicatorStyles({ size }),
                normalizeBaseUiStyling(propClassName, state),
            )
        }
        {...props}
    />
)

interface RadioGroupItemProps {
    value: string
    size: RadioSize
}
const RadioGroupItem = (props: RadioGroupItemProps) => {
    const fieldContext = useFieldContext()

    const id = fieldContext?.inputId
    const disabled = fieldContext?.disabled
    const required = fieldContext?.required

    return (
        <RadioRoot
            id={id}
            value={props.value}
            size={props.size}
            disabled={disabled}
            required={required}
        >
            <RadioIndicator size={props.size} />
        </RadioRoot>
    )
}

interface RadioGroupProps<T extends string> extends StrictOmit<
    ComponentProps<typeof RadioGroupRoot>,
    "value" | "onValueChange" | "defaultValue" | "className"
> {
    itemSchema: ZodType<T>
    items: T[]
    getItemLabel: (option: T) => string
    value: T | undefined
    onValueChange: (value: T) => void
    size?: RadioSize
    suppressFieldCallbacks?: boolean
    className?: SwitchableModeClassName<typeof RadioGroupRoot>
}
export const RadioGroup = <T extends string>({
    itemSchema,
    items,
    getItemLabel,
    value,
    onValueChange: propOnValueChange,
    disabled: propDisabled,
    required: propRequired,
    "aria-labelledby": propAriaLabelledBy,
    "aria-describedby": propAriaDescribedBy,
    size = "sm",
    suppressFieldCallbacks,
    onChange: propOnChange,
    onBlur: propOnBlur,
    className: propClassName,
    ...props
}: RadioGroupProps<T>) => {
    const groupFieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)

    const disabled = propDisabled ?? groupFieldContext?.disabled
    const required = propRequired ?? groupFieldContext?.required
    const ariaLabelledBy = propAriaLabelledBy ?? groupFieldContext?.labelId
    const ariaDescribedBy = propAriaDescribedBy ?? groupFieldContext?.describedByIds

    if (mode === "view") {
        return (
            <InputView
                className={cn(normalizeBaseUiStyling(propClassName, { mode: "view" }))}
            >
                {isDefined(value) && getItemLabel(value)}
            </InputView>
        )
    }

    const onValueChange = (newValue: T | null) => {
        const parsed = itemSchema.safeParse(newValue)
        if (!parsed.success) {
            return
        }

        propOnValueChange(parsed.data)
    }

    const onChange: NonNullable<RadioGroupProps<T>["onChange"]> = event => {
        propOnChange?.(event)
        callbacks.onChange()
    }

    const onBlur: NonNullable<RadioGroupProps<T>["onBlur"]> = event => {
        propOnBlur?.(event)
        callbacks.onBlur(event)
    }

    return (
        <RadioGroupRoot
            value={value ?? null}
            onValueChange={onValueChange}
            disabled={disabled}
            required={required}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            onChange={onChange}
            onBlur={onBlur}
            className={state =>
                cn(
                    {
                        "flex flex-col gap-1": size === "sm",
                        "flex flex-col gap-1.5": size === "md",
                    },
                    normalizeBaseUiStyling(propClassName, { mode: "edit", state }),
                )
            }
            {...props}
        >
            {items.map(option => (
                <Field
                    key={option}
                    label={getItemLabel(option)}
                    labelSide="right"
                    disabled={disabled}
                    required={false}
                    dimDisabled={false}
                >
                    <RadioGroupItem value={option} size={size} />
                </Field>
            ))}
        </RadioGroupRoot>
    )
}
