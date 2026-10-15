import { cn } from "frontend-shared/styles"
import type { ReactNode } from "react"
import type { StrictExclude, StrictOmit } from "shared/types"

import {
    useFieldCallbacks,
    useFieldContext,
    useFieldInputMode,
} from "../field/field.context"
import {
    inputAffixStyles,
    inputInputStyles,
    inputRootStyles,
    inputViewRootStyles,
    inputViewValueStyles,
} from "./input.styles"

export interface InputProps extends StrictOmit<
    React.ComponentProps<"input">,
    "size" | "prefix"
> {
    error?: boolean
    size?: "sm" | "md"
    icon?: ReactNode
    iconSide?: "left" | "right"
    prefix?: ReactNode
    suffix?: ReactNode
    suppressFieldCallbacks?: boolean
}
export const Input = ({
    id: propId,
    disabled: propDisabled,
    required: propRequired,
    className: propClassName,
    error: propError,
    "aria-describedby": propAriaDescribedBy,
    size = "md",
    icon,
    iconSide = "left",
    prefix,
    suffix,
    suppressFieldCallbacks,
    onChange: propOnChange,
    onBlur: propOnBlur,
    ...props
}: InputProps) => {
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)

    const id = propId ?? fieldContext?.inputId
    const disabled = propDisabled ?? !!fieldContext?.disabled
    const required = propRequired ?? !!fieldContext?.required
    const error = propError ?? !!fieldContext?.errors
    const ariaDescribedBy = propAriaDescribedBy ?? fieldContext?.describedByIds

    if (mode === "view") {
        return (
            <InputView
                size={size}
                icon={icon}
                iconSide={iconSide}
                prefix={prefix}
                suffix={suffix}
                className={propClassName}
            >
                {props.value ?? props.defaultValue}
            </InputView>
        )
    }

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        propOnChange?.(event)
        callbacks.onChange()
    }

    const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        propOnBlur?.(event)
        callbacks.onBlur(event)
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
        >
            {icon && iconSide === "left" && <InputIcon icon={icon} size={size} />}
            {prefix && <span className={inputAffixStyles()}>{prefix}</span>}
            <input
                type="text"
                id={id}
                disabled={disabled}
                required={required}
                aria-describedby={ariaDescribedBy}
                className={inputInputStyles()}
                onChange={onChange}
                onBlur={onBlur}
                {...props}
            />
            {suffix && <span className={inputAffixStyles()}>{suffix}</span>}
            {icon && iconSide === "right" && <InputIcon icon={icon} size={size} />}
        </div>
    )
}

export interface InputViewProps {
    size?: "sm" | "md"
    icon?: ReactNode
    iconSide?: "left" | "right"
    prefix?: ReactNode
    suffix?: ReactNode
    className?: string
    children?: ReactNode
}
export const InputView = ({
    size = "md",
    icon,
    iconSide = "left",
    prefix,
    suffix,
    className,
    children,
}: InputViewProps) => (
    <div className={cn(inputViewRootStyles({ size, forceSquare: false }), className)}>
        {icon && iconSide === "left" && <InputIcon icon={icon} size={size} />}
        {prefix && <span className={inputAffixStyles()}>{prefix}</span>}
        <span className={inputViewValueStyles()}>{children}</span>
        {suffix && <span className={inputAffixStyles()}>{suffix}</span>}
        {icon && iconSide === "right" && <InputIcon icon={icon} size={size} />}
    </div>
)

interface InputIconProps {
    icon: StrictExclude<ReactNode, undefined | null>
    size: "sm" | "md"
    className?: string
}
export const InputIcon = ({ icon, size, className }: InputIconProps) => (
    <div
        className={cn(
            "[&>svg]:text-neutral-600 dark:[&>svg]:text-neutral-300",
            {
                "[&>svg]:size-4": size === "sm",
                "[&>svg]:size-5": size === "md",
            },
            className,
        )}
    >
        {icon}
    </div>
)
