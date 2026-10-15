import { isValid } from "date-fns"
import { omit } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import type { ChangeEvent, FocusEvent, PointerEvent } from "react"
import { useState } from "react"
import { formatDate, isoDate } from "shared/temporal"
import type { StrictOmit } from "shared/types"
import { isDefined } from "shared/values"

import { DayPicker } from "../day-picker/day-picker"
import type { DayPickerProps } from "../day-picker/day-picker"
import {
    useFieldCallbacks,
    useFieldContext,
    useFieldInputMode,
} from "../field/field.context"
import { useUiContext } from "../i18n/ui-context"
import { IconXMark } from "../icons/icons"
import { Input, InputView } from "../input/input"
import type { InputProps } from "../input/input"
import { inputRootStyles } from "../input/input.styles"
import { PopoverContent, PopoverRoot, PopoverTrigger } from "../popover/popover"

// TODO use Temporal.PlainDate once widely available - https://caniuse.com/temporal

interface NativeDateInputProps extends StrictOmit<
    InputProps,
    "value" | "onChange" | "type" | "min" | "max"
> {
    mode: "native"
    value: Date | undefined
    onValueChange: (value: Date | undefined) => void
    min?: Date
    max?: Date
    error?: boolean
    suppressFieldCallbacks?: boolean
}

interface CustomDateInputProps extends StrictOmit<
    DayPickerProps,
    "value" | "onValueChange"
> {
    mode?: "custom"
    id?: string
    value: Date | undefined
    onValueChange: (value: Date | undefined) => void
    isDayDisabled?: (date: Date) => boolean
    required?: boolean
    disabled?: boolean
    error?: boolean
    suppressFieldCallbacks?: boolean
    "aria-describedby"?: string
}

type DateInputProps = NativeDateInputProps | CustomDateInputProps

export const DateInput = ({
    value: propValue,
    onValueChange,
    min,
    max,
    id: propId,
    required: propRequired,
    disabled: propDisabled,
    error: propError,
    "aria-describedby": propAriaDescribedBy,
    suppressFieldCallbacks,
    className,
    ...props
}: DateInputProps) => {
    const { i18n } = useUiContext()
    const [open, setOpen] = useState(false)
    const fieldContext = useFieldContext()
    const formMode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)

    const id = propId ?? fieldContext?.inputId
    const disabled = propDisabled ?? !!fieldContext?.disabled
    const required = propRequired ?? fieldContext?.required
    const error = propError ?? !!fieldContext?.errors
    const ariaDescribedBy = propAriaDescribedBy ?? fieldContext?.describedByIds

    if (formMode === "view") {
        return (
            <InputView className={className}>
                {isDefined(propValue) &&
                    formatDate(propValue, {
                        template: "PPP",
                        locale: i18n.dateFns.locale,
                    })}
            </InputView>
        )
    }

    const nativeValue = isDefined(propValue) ? isoDate(propValue) : ""
    const nativeMin = isDefined(min) ? isoDate(min) : undefined
    const nativeMax = isDefined(max) ? isoDate(max) : undefined
    const nativeOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newValueRaw = event.target.value
        if (newValueRaw.length === 0) {
            onValueChange(undefined)
            return
        }

        const newValue = new Date(newValueRaw)
        if (!isValid(newValue)) {
            return
        }

        onValueChange(newValue)
    }

    if (props.mode === "native") {
        return (
            <Input
                type="date"
                id={id}
                value={nativeValue}
                onChange={nativeOnChange}
                required={required}
                disabled={disabled}
                error={error}
                aria-describedby={ariaDescribedBy}
                min={nativeMin}
                max={nativeMax}
                suppressFieldCallbacks={suppressFieldCallbacks}
                className={className}
                {...omit(props, ["mode"])}
            />
        )
    }

    const formatted = propValue
        ? formatDate(propValue, { template: "PPP", locale: i18n.dateFns.locale })
        : i18n.t("DateInput.Placeholder", undefined)
    const isOutOfConstraints = (date: Date) =>
        (isDefined(min) && date < min) ||
        (isDefined(max) && date > max) ||
        (props.isDayDisabled?.(date) ?? false)
    const showReset = isDefined(propValue) && !disabled

    // Records the blur on every close, because the popover holds the focus while it is open
    const closePopover = () => {
        setOpen(false)
        if (open) {
            callbacks.onBlur()
        }
    }
    const onOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            closePopover()
            return
        }

        setOpen(true)
    }
    const onTriggerBlur = (event: FocusEvent<HTMLButtonElement>) => {
        if (open) {
            return
        }

        callbacks.onBlur(event)
    }

    const onResetPointerDown = (event: PointerEvent<HTMLSpanElement>) => {
        event.preventDefault()
        event.stopPropagation()
        onValueChange(undefined)
        callbacks.onChange()
        closePopover()
    }

    const onDayPickerValueChange = (value: Date) => {
        if (isOutOfConstraints(value)) {
            return
        }
        onValueChange(value)
        callbacks.onChange()
        closePopover()
    }

    const trigger = (
        <button
            type="button"
            // SAFETY: `aria-controls` and `aria-expanded` are managed by base-ui
            // oxlint-disable-next-line jsx-a11y/role-has-required-aria-props
            role="combobox"
            aria-required={required}
            aria-describedby={ariaDescribedBy}
            onBlur={onTriggerBlur}
            className={cn(
                inputRootStyles({
                    size: "md",
                    disabled,
                    error,
                }),
                "justify-between hover:cursor-default disabled:cursor-not-allowed",
                className,
            )}
        >
            <span
                className={cn("tp-body-md", {
                    "text-fg-muted": !propValue,
                })}
            >
                {formatted}
            </span>
            {showReset && (
                <span
                    role="button"
                    aria-label={i18n.t("DateInput.Reset", undefined)}
                    tabIndex={-1}
                    data-input-reset={true}
                    className="[&>svg]:text-fg-muted [&>svg]:size-4"
                    onPointerDown={onResetPointerDown}
                >
                    <IconXMark />
                </span>
            )}
        </button>
    )

    return (
        <PopoverRoot open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger id={id} disabled={disabled} render={trigger} />
            <PopoverContent className="p-1">
                <DayPicker
                    value={propValue}
                    onValueChange={onDayPickerValueChange}
                    min={min}
                    max={max}
                    isDayDisabled={props.isDayDisabled}
                    suppressFieldCallbacks={true}
                    className="border-0"
                />
            </PopoverContent>
        </PopoverRoot>
    )
}
