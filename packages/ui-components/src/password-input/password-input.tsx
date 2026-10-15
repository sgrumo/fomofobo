import { cn } from "frontend-shared/styles"
import type { ChangeEvent, ComponentProps } from "react"
import { useState } from "react"
import type { Select, StrictOmit } from "shared/types"
import { isDefined } from "shared/values"

import {
    useFieldCallbacks,
    useFieldContext,
    useFieldInputMode,
} from "../field/field.context"
import { useUiContext } from "../i18n/ui-context"
import { IconEye, IconEyeClosed } from "../icons/icons"
import { InputIcon, InputView } from "../input/input"
import { inputInputStyles, inputRootStyles } from "../input/input.styles"

interface PasswordInputProps extends StrictOmit<
    ComponentProps<"input">,
    | "type"
    | "size"
    | "autoComplete"
    | "autoCorrect"
    | "spellCheck"
    | "autoCapitalize"
    | "inputMode"
> {
    value: string | undefined
    onValueChange: (value: string | undefined) => void
    allowShow?: boolean
    autoComplete: Select<
        ComponentProps<"input">["autoComplete"],
        "new-password" | "current-password"
    >
    inputMode?: Select<ComponentProps<"input">["inputMode"], "text" | "numeric">
    error?: boolean
    size?: "sm" | "md"
    suppressFieldCallbacks?: boolean
}
export const PasswordInput = ({
    id: propId,
    value: propValue,
    onValueChange,
    allowShow = true,
    autoComplete,
    inputMode = "text",
    suppressFieldCallbacks,
    onChange: propOnChange,
    onBlur: propOnBlur,
    disabled: propDisabled,
    required: propRequired,
    className: propClassName,
    error: propError,
    "aria-describedby": propAriaDescribedBy,
    size = "md",
    ...props
}: PasswordInputProps) => {
    const { i18n } = useUiContext()
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)
    const handleBlur = callbacks.onBlur

    const [show, setShow] = useState(false)
    const type = (allowShow ? show : false) ? "text" : "password"

    if (mode === "view") {
        return (
            <InputView size={size} className={propClassName}>
                {isDefined(propValue) && "••••••••"}
            </InputView>
        )
    }

    const id = propId ?? fieldContext?.inputId
    const disabled = propDisabled ?? !!fieldContext?.disabled
    const required = propRequired ?? !!fieldContext?.required
    const error = propError ?? !!fieldContext?.errors
    const ariaDescribedBy = propAriaDescribedBy ?? fieldContext?.describedByIds

    const value = propValue ?? ""
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        propOnChange?.(event)
        if (event.defaultPrevented) {
            return
        }

        onValueChange(event.target.value === "" ? undefined : event.target.value)
        callbacks.onChange()
    }

    return (
        <div
            className={cn(
                inputRootStyles({
                    size,
                    disabled,
                    error,
                }),
                propClassName,
            )}
            onBlur={handleBlur}
        >
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                onBlur={propOnBlur}
                disabled={disabled}
                required={required}
                aria-describedby={ariaDescribedBy}
                className={inputInputStyles()}
                autoComplete={autoComplete}
                inputMode={inputMode}
                autoCorrect="off"
                spellCheck="false"
                autoCapitalize="off"
                {...props}
            />
            {allowShow && (
                <button
                    type="button"
                    aria-label={i18n.t(
                        show ? "PasswordInput.Hide" : "PasswordInput.Show",
                        undefined,
                    )}
                    onClick={() => {
                        setShow(!show)
                    }}
                >
                    <InputIcon
                        icon={show ? <IconEyeClosed /> : <IconEye />}
                        size={size}
                        className="[&>svg]:hover:text-fg [&>svg]:transition-colors"
                    />
                </button>
            )}
        </div>
    )
}
