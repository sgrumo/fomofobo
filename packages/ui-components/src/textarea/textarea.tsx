import { cn } from "frontend-shared/styles"
import type { StrictOmit } from "shared/types"

import {
    useFieldCallbacks,
    useFieldContext,
    useFieldInputMode,
} from "../field/field.context"
import {
    inputInputStyles,
    inputRootStyles,
    inputViewRootStyles,
} from "../input/input.styles"

export interface TextareaProps extends StrictOmit<
    React.ComponentProps<"textarea">,
    "value"
> {
    value: string | undefined
    onValueChange: (value: string | undefined) => void
    error?: boolean
    suppressFieldCallbacks?: boolean
}
export const Textarea = ({
    id: propId,
    disabled: propDisabled,
    required: propRequired,
    className: propClassName,
    error: propError,
    "aria-describedby": propAriaDescribedBy,
    value: propValue,
    onValueChange,
    onChange: propOnChange,
    onBlur: propOnBlur,
    suppressFieldCallbacks,
    rows = 4,
    ...props
}: TextareaProps) => {
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)

    const id = propId ?? fieldContext?.inputId
    const disabled = propDisabled ?? !!fieldContext?.disabled
    const required = propRequired ?? !!fieldContext?.required
    const error = propError ?? !!fieldContext?.errors
    const ariaDescribedBy = propAriaDescribedBy ?? fieldContext?.describedByIds

    const value = propValue ?? ""

    if (mode === "view") {
        return (
            <div
                className={cn(
                    inputViewRootStyles({ size: "md", forceSquare: false }),
                    "h-auto items-stretch",
                    propClassName,
                )}
            >
                <span
                    className="tp-body-md w-full whitespace-pre-wrap"
                    style={{ minHeight: `${rows}lh` }}
                >
                    {value}
                </span>
            </div>
        )
    }
    const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        propOnChange?.(event)
        onValueChange(event.target.value === "" ? undefined : event.target.value)
        callbacks.onChange()
    }

    const onBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
        propOnBlur?.(event)
        callbacks.onBlur(event)
    }

    return (
        <div
            className={cn(
                inputRootStyles({ size: "md", disabled, error }),
                "flex h-auto items-stretch",
                propClassName,
            )}
        >
            <textarea
                id={id}
                disabled={disabled}
                required={required}
                aria-describedby={ariaDescribedBy}
                rows={rows}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className={inputInputStyles()}
                {...props}
            />
        </div>
    )
}
