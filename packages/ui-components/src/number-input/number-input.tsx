import { NumberField } from "@base-ui/react"
import { pipe } from "es-toolkit/fp"
import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"
import { Result } from "shared/result"
import type { StrictOmit } from "shared/types"
import { isDefined } from "shared/values"

import {
    useFieldCallbacks,
    useFieldContext,
    useFieldInputMode,
} from "../field/field.context"
import { useUiContext } from "../i18n/ui-context"
import { IconCircleMinus, IconCirclePlus } from "../icons/icons"
import { InputView } from "../input/input"
import { inputInputStyles, inputRootStyles } from "../input/input.styles"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import type { SwitchableModeClassName } from "../styling/styling.helper"
import { numberInputStepTriggerIconStyles } from "./number-input.styles"

interface NumberInputProps extends StrictOmit<
    ComponentProps<typeof NumberField.Root>,
    "value" | "onValueChange" | "smallStep" | "largeStep" | "className"
> {
    size: "sm" | "md"
    value: number | undefined
    onValueChange: (value: number | undefined) => void
    controls?: boolean
    error?: boolean
    "aria-label"?: string
    suppressFieldCallbacks?: boolean
    className?: SwitchableModeClassName<typeof NumberField.Root>
}
// TODO check that min/max/steps validate, use validate prop workaround if they don't
// - https://github.com/mui/base-ui/issues/1845
// - https://github.com/mui/base-ui/issues/3368
export const NumberInput = ({
    size,
    value: propValue,
    onValueChange: propOnValueChange,
    snapOnStep = true,
    format: propFormat,
    controls: propControls = true,
    id: propId,
    disabled: propDisabled,
    required: propRequired,
    error: propError,
    "aria-describedby": propAriaDescribedBy,
    "aria-label": ariaLabel,
    suppressFieldCallbacks,
    className: propClassName,
    ...props
}: NumberInputProps) => {
    const { i18n } = useUiContext()
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)
    const handleBlur = callbacks.onBlur

    const id = propId ?? fieldContext?.inputId
    const disabled = propDisabled ?? !!fieldContext?.disabled
    const required = propRequired ?? !!fieldContext?.required
    const error = propError ?? !!fieldContext?.errors
    const ariaDescribedBy = propAriaDescribedBy ?? fieldContext?.describedByIds

    if (mode === "view") {
        const formatted = isDefined(propValue)
            ? pipe(
                  Result.try(() =>
                      new Intl.NumberFormat(props.locale, {
                          useGrouping: false,
                          ...propFormat,
                      }).format(propValue),
                  ),
                  Result.unwrapOr(i18n.t("NumberInput.FormatError", undefined)),
              )
            : null
        return (
            <InputView
                size={size}
                className={cn(normalizeBaseUiStyling(propClassName, { mode: "view" }))}
            >
                {formatted}
            </InputView>
        )
    }

    const value = propValue ?? null
    const onValueChange = (newValue: number | null) => {
        propOnValueChange(newValue ?? undefined)
        callbacks.onChange()
    }

    return (
        <NumberField.Root
            value={value}
            onValueChange={onValueChange}
            snapOnStep={snapOnStep}
            id={id}
            disabled={disabled}
            required={required}
            className={state =>
                cn(
                    inputRootStyles({ size, disabled, error }),
                    normalizeBaseUiStyling(propClassName, { mode: "edit", state }),
                )
            }
            format={{
                useGrouping: false,
                ...propFormat,
            }}
            {...props}
        >
            <NumberField.Group
                className="flex w-full items-center gap-2"
                onBlur={handleBlur}
            >
                {propControls && (
                    <NumberField.Decrement
                        aria-label={i18n.t("NumberInput.Decrement", undefined)}
                        className="group disabled:cursor-not-allowed"
                    >
                        <IconCircleMinus
                            className={numberInputStepTriggerIconStyles({
                                size,
                                disabled,
                            })}
                        />
                    </NumberField.Decrement>
                )}
                <NumberField.Input
                    formNoValidate={false}
                    aria-describedby={ariaDescribedBy}
                    aria-label={ariaLabel}
                    className={inputInputStyles()}
                />
                {propControls && (
                    <NumberField.Increment
                        aria-label={i18n.t("NumberInput.Increment", undefined)}
                        className="group disabled:cursor-not-allowed"
                    >
                        <IconCirclePlus
                            className={numberInputStepTriggerIconStyles({
                                size,
                                disabled,
                            })}
                        />
                    </NumberField.Increment>
                )}
            </NumberField.Group>
        </NumberField.Root>
    )
}
