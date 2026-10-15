import { OTPField } from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"
import { useId } from "react"
import type { StrictOmit } from "shared/types"
import { isDefined } from "shared/values"

import {
    useFieldCallbacks,
    useFieldContext,
    useFieldInputMode,
} from "../field/field.context"
import { useUiContext } from "../i18n/ui-context"
import { InputView } from "../input/input"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import type { SwitchableModeClassName } from "../styling/styling.helper"
import {
    otpInputRootStyles,
    otpInputSeparatorStyles,
    otpInputSlotStyles,
} from "./otp-input.styles"

interface OtpInputProps extends StrictOmit<
    ComponentProps<typeof OTPField.Root>,
    | "value"
    | "defaultValue"
    | "onValueChange"
    | "onValueComplete"
    | "children"
    | "render"
    | "className"
> {
    value: string | undefined
    onValueChange: (value: string | undefined) => void
    onValueComplete?: (value: string) => void
    size?: "sm" | "md"
    groupSize?: number
    error?: boolean
    suppressFieldCallbacks?: boolean
    className?: SwitchableModeClassName<typeof OTPField.Root>
}
export const OtpInput = ({
    length,
    value: propValue,
    onValueChange,
    onValueComplete,
    size = "md",
    groupSize,
    mask = false,
    id: propId,
    disabled: propDisabled,
    required: propRequired,
    error: propError,
    "aria-describedby": propAriaDescribedBy,
    suppressFieldCallbacks,
    className: propClassName,
    ...props
}: OtpInputProps) => {
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
        return (
            <InputView
                size={size}
                className={cn(normalizeBaseUiStyling(propClassName, { mode: "view" }))}
            >
                {isDefined(propValue) &&
                    (mask ? "•".repeat(propValue.length) : propValue)}
            </InputView>
        )
    }

    return (
        <OTPField.Root
            length={length}
            value={propValue ?? ""}
            onValueChange={nextValue => {
                onValueChange(nextValue === "" ? undefined : nextValue)
                callbacks.onChange()
            }}
            onValueComplete={nextValue => {
                onValueComplete?.(nextValue)
            }}
            mask={mask}
            id={id}
            disabled={disabled}
            required={required}
            aria-describedby={ariaDescribedBy}
            onBlur={handleBlur}
            className={state =>
                cn(
                    otpInputRootStyles(),
                    normalizeBaseUiStyling(propClassName, { mode: "edit", state }),
                )
            }
            {...props}
        >
            {Array.from({ length }, (_, index) => (
                // SAFETY: `length` fixes the slot count, so an index always names the same slot
                <OtpInputSlot
                    key={index}
                    position={index + 1}
                    separated={
                        isDefined(groupSize) && index > 0 && index % groupSize === 0
                    }
                    size={size}
                    disabled={disabled}
                    error={error}
                    fieldLabelId={fieldContext?.labelId}
                />
            ))}
        </OTPField.Root>
    )
}

interface OtpInputSlotProps {
    position: number
    separated: boolean
    size: "sm" | "md"
    disabled: boolean
    error: boolean
    fieldLabelId: string | undefined
}
const OtpInputSlot = (props: OtpInputSlotProps) => {
    const { i18n } = useUiContext()
    const labelId = useId()

    return (
        <>
            {props.separated && (
                <OTPField.Separator className={otpInputSeparatorStyles()} />
            )}
            <span id={labelId} hidden={true}>
                {i18n.t("OtpInput.Slot", { position: props.position })}
            </span>
            <OTPField.Input
                aria-labelledby={[labelId, props.fieldLabelId]
                    .filter(isDefined)
                    .join(" ")}
                className={otpInputSlotStyles({
                    size: props.size,
                    disabled: props.disabled,
                    error: props.error,
                })}
            />
        </>
    )
}
