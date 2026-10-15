import { Select as SelectPrimitive } from "@base-ui/react"
import { difference } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import { i18nArity } from "i18n/i18n"
import { useState } from "react"
import type { ComponentProps, KeyboardEvent, PointerEvent, ReactNode } from "react"
import { containEvent } from "react-shared"
import type { StrictOmit } from "shared/types"
import { isDefined } from "shared/values"
import { z } from "zod"

import {
    useFieldCallbacks,
    useFieldContext,
    useFieldInputMode,
} from "../field/field.context"
import { useUiContext } from "../i18n/ui-context"
import { IconCheck, IconChevronDown, IconXMark } from "../icons/icons"
import { InputView } from "../input/input"
import { Spinner } from "../spinner/spinner"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import {
    compositeMultipleSelectTriggerStyles,
    compositeSelectResetStyles,
    compositeSingleSelectTriggerStyles,
    selectEmptyStyles,
    selectIconStyles,
    selectItemIndicatorStyles,
    selectItemStyles,
    selectItemTextStyles,
    selectListStyles,
    selectPopupStyles,
    selectPositionerStyles,
    selectScrollArrowStyles,
    selectTriggerStyles,
    selectValueStyles,
} from "./select.styles"

const SelectRoot = SelectPrimitive.Root
const SelectPortal = SelectPrimitive.Portal

interface SelectTriggerProps extends ComponentProps<typeof SelectPrimitive.Trigger> {
    error: boolean
}
export const SelectTrigger = ({ className, error, ...props }: SelectTriggerProps) => (
    <SelectPrimitive.Trigger
        className={state =>
            cn(selectTriggerStyles({ error }), normalizeBaseUiStyling(className, state))
        }
        {...props}
    />
)

export const SelectValue = ({
    className,
    placeholder: propPlaceholder,
    ...props
}: ComponentProps<typeof SelectPrimitive.Value>) => {
    const { i18n } = useUiContext()
    const placeholder = propPlaceholder ?? i18n.t("Combobox.Placeholder", undefined)

    return (
        <SelectPrimitive.Value
            className={state =>
                cn(selectValueStyles(), normalizeBaseUiStyling(className, state))
            }
            placeholder={placeholder}
            render={renderProps => <div {...renderProps} />}
            {...props}
        />
    )
}

interface SelectIconProps extends ComponentProps<typeof SelectPrimitive.Icon> {
    rotate: 0 | 180
}
export const SelectIcon = ({ className, rotate, ...props }: SelectIconProps) => (
    <SelectPrimitive.Icon
        className={state =>
            cn(selectIconStyles({ rotate }), normalizeBaseUiStyling(className, state))
        }
        {...props}
    />
)

export const SelectPositioner = ({
    className,
    ...props
}: ComponentProps<typeof SelectPrimitive.Positioner>) => (
    <SelectPrimitive.Positioner
        className={state =>
            cn(selectPositionerStyles(), normalizeBaseUiStyling(className, state))
        }
        {...props}
    />
)

export const SelectPopup = ({
    className,
    style: propStyle,
    ...props
}: ComponentProps<typeof SelectPrimitive.Popup>) => {
    const computedSelectPopupStyles = selectPopupStyles()
    return (
        <SelectPrimitive.Popup
            className={state =>
                cn(
                    computedSelectPopupStyles.className,
                    normalizeBaseUiStyling(className, state),
                )
            }
            style={state => ({
                ...computedSelectPopupStyles.style,
                ...normalizeBaseUiStyling(propStyle, state),
            })}
            {...props}
        />
    )
}

export const SelectList = ({
    className,
    ...props
}: ComponentProps<typeof SelectPrimitive.List>) => (
    <SelectPrimitive.List
        className={state =>
            cn(selectListStyles(), normalizeBaseUiStyling(className, state))
        }
        {...props}
    />
)

const SelectEmpty = () => {
    const { i18n } = useUiContext()
    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={selectEmptyStyles()}
        >
            {i18n.t("Combobox.Empty", undefined)}
        </div>
    )
}

interface SelectItemProps extends StrictOmit<
    ComponentProps<typeof SelectPrimitive.Item>,
    "value"
> {
    value?: string | number
}
export const SelectItem = ({ className, ...props }: SelectItemProps) => (
    <SelectPrimitive.Item
        className={state =>
            cn(selectItemStyles(), normalizeBaseUiStyling(className, state))
        }
        {...props}
    />
)

export const SelectItemIndicator = ({
    className,
    ...props
}: ComponentProps<typeof SelectPrimitive.ItemIndicator>) => (
    <SelectPrimitive.ItemIndicator
        className={state =>
            cn(selectItemIndicatorStyles(), normalizeBaseUiStyling(className, state))
        }
        {...props}
    />
)

export const SelectItemText = ({
    className,
    ...props
}: ComponentProps<typeof SelectPrimitive.ItemText>) => (
    <SelectPrimitive.ItemText
        className={state =>
            cn(selectItemTextStyles(), normalizeBaseUiStyling(className, state))
        }
        {...props}
    />
)

export const SelectScrollUpArrow = ({
    className,
    ...props
}: ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) => (
    <SelectPrimitive.ScrollUpArrow
        className={state =>
            cn(selectScrollArrowStyles("up"), normalizeBaseUiStyling(className, state))
        }
        {...props}
    >
        <IconChevronDown />
    </SelectPrimitive.ScrollUpArrow>
)

export const SelectScrollDownArrow = ({
    className,
    ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) => (
    <SelectPrimitive.ScrollDownArrow
        className={state =>
            cn(selectScrollArrowStyles("down"), normalizeBaseUiStyling(className, state))
        }
        {...props}
    >
        <IconChevronDown />
    </SelectPrimitive.ScrollDownArrow>
)

interface SelectResetProps {
    onReset: () => void
}
const SelectReset = (props: SelectResetProps) => {
    const { i18n } = useUiContext()

    const onPointerDown = (event: PointerEvent<HTMLSpanElement>) => {
        containEvent(event)
        props.onReset()
    }

    const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key !== "Enter" && event.key !== " ") {
            return
        }

        containEvent(event)
        props.onReset()
    }

    return (
        <span
            role="button"
            aria-label={i18n.t("Combobox.Reset", undefined)}
            className={compositeSelectResetStyles()}
            onPointerDown={onPointerDown}
            onKeyDown={onKeyDown}
            onMouseDown={containEvent}
            onClick={containEvent}
            tabIndex={-1}
            data-select-reset={true}
        >
            <IconXMark />
        </span>
    )
}

interface BaseSelectProps<T> extends StrictOmit<
    ComponentProps<typeof SelectRoot>,
    "items" | "value" | "onValueChange" | "defaultValue" | "open"
> {
    items: T[]
    getItemId: (value: NoInfer<T>) => string
    renderItem: (props: { item: NoInfer<T>; position: "trigger" | "list" }) => ReactNode
    resettable: boolean
    placeholder?: string
    id?: string
    className?: string
    loading?: boolean
    suppressFieldCallbacks?: boolean
    "aria-describedby"?: string
    "aria-label"?: string
}

interface SingleSelectProps<T> extends BaseSelectProps<T> {
    multiple: false
    value: NoInfer<T> | undefined
    onValueChange: (value: NoInfer<T> | undefined) => void
}
interface MultipleSelectProps<T> extends BaseSelectProps<T> {
    multiple: true
    value: Array<NoInfer<T>>
    onValueChange: (value: Array<NoInfer<T>>) => void
}

type SelectProps<T> = SingleSelectProps<T> | MultipleSelectProps<T>

const SingleSelect = <T,>({
    items: propItems,
    getItemId,
    renderItem: ItemComponent,
    resettable,
    placeholder: propPlaceholder,
    value: propValue,
    onValueChange: propOnValueChange,
    onOpenChange: propOnOpenChange,
    disabled: propDisabled,
    id: propId,
    "aria-describedby": propAriaDescribedBy,
    "aria-label": ariaLabel,
    loading,
    suppressFieldCallbacks,
    className,
    ...props
}: SingleSelectProps<T>) => {
    const [open, setOpen] = useState(false)

    const { i18n } = useUiContext()
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)

    // Records the blur on every close, because the popup holds the focus while it is open
    const onOpenChange = (
        newOpen: boolean,
        eventDetails: SelectPrimitive.Root.ChangeEventDetails,
    ) => {
        setOpen(newOpen)
        propOnOpenChange?.(newOpen, eventDetails)

        if (!newOpen) {
            callbacks.onBlur()
        }
    }
    const onTriggerBlur: NonNullable<
        ComponentProps<typeof SelectTrigger>["onBlur"]
    > = event => {
        if (open) {
            return
        }

        callbacks.onBlur(event)
    }

    if (mode === "view") {
        return (
            <InputView className={className}>
                {isDefined(propValue) && (
                    <ItemComponent item={propValue} position="trigger" />
                )}
            </InputView>
        )
    }

    const placeholder = propPlaceholder ?? i18n.t("Combobox.Placeholder", undefined)

    const value = isDefined(propValue) ? getItemId(propValue) : null
    const items = (() => {
        const currentItem = propValue
        if (!isDefined(currentItem)) {
            return propItems
        }

        const currentValueId = getItemId(currentItem)
        return propItems.some(item => getItemId(item) === currentValueId)
            ? propItems
            : [currentItem, ...propItems]
    })()

    const disabled = loading ? true : (propDisabled ?? !!fieldContext?.disabled)
    const id = propId ?? fieldContext?.inputId
    const error = !!fieldContext?.errors
    const ariaDescribedBy = propAriaDescribedBy ?? fieldContext?.describedByIds

    const onValueChange = (newValue: unknown) => {
        if (disabled) {
            return
        }

        if (typeof newValue !== "string") {
            propOnValueChange(undefined)
            callbacks.onChange()
            return
        }

        const matchedItem = items.find(item => getItemId(item) === newValue)
        propOnValueChange(matchedItem)
        callbacks.onChange()
    }
    const onReset = () => {
        if (disabled) {
            return
        }

        propOnValueChange(undefined)
        callbacks.onChange()
    }

    const selectValueChildren = (selectValue: unknown) => {
        if (!isDefined(selectValue)) {
            return placeholder
        }

        if (typeof selectValue !== "string") {
            return undefined
        }

        const matchedItem = items.find(item => getItemId(item) === selectValue)
        if (!isDefined(matchedItem)) {
            return undefined
        }

        return <ItemComponent item={matchedItem} position="trigger" />
    }

    return (
        <SelectRoot
            value={value}
            onValueChange={onValueChange}
            open={open}
            onOpenChange={onOpenChange}
            disabled={disabled}
            {...props}
        >
            <SelectTrigger
                id={id}
                error={error}
                aria-describedby={ariaDescribedBy}
                aria-label={ariaLabel}
                onBlur={onTriggerBlur}
                className={cn(compositeSingleSelectTriggerStyles(), className)}
            >
                {loading && <Spinner size="xs" />}
                {!loading && (
                    <SelectValue placeholder={placeholder}>
                        {selectValueChildren}
                    </SelectValue>
                )}
                {resettable && isDefined(value) && !disabled && (
                    <SelectReset onReset={onReset} />
                )}
                {(!resettable || !isDefined(value)) && !disabled && !loading && (
                    <SelectIcon rotate={open ? 180 : 0}>
                        <IconChevronDown />
                    </SelectIcon>
                )}
            </SelectTrigger>
            <SelectPortal>
                <SelectPositioner
                    side="bottom"
                    alignItemWithTrigger={false}
                    sideOffset={4}
                >
                    <SelectPopup>
                        {items.length === 0 && <SelectEmpty />}
                        <SelectScrollUpArrow />
                        <SelectList>
                            {items.map(item => {
                                const itemId = getItemId(item)

                                return (
                                    <SelectItem key={itemId} value={itemId}>
                                        <SelectItemText>
                                            <ItemComponent item={item} position="list" />
                                        </SelectItemText>
                                        <SelectItemIndicator>
                                            <IconCheck />
                                        </SelectItemIndicator>
                                    </SelectItem>
                                )
                            })}
                        </SelectList>
                        <SelectScrollDownArrow />
                    </SelectPopup>
                </SelectPositioner>
            </SelectPortal>
        </SelectRoot>
    )
}

const MultipleSelect = <T,>({
    items: propItems,
    getItemId,
    renderItem: ItemComponent,
    resettable,
    placeholder: propPlaceholder,
    value: propValue,
    onValueChange: propOnValueChange,
    onOpenChange: propOnOpenChange,
    disabled: propDisabled,
    id: propId,
    "aria-describedby": propAriaDescribedBy,
    "aria-label": ariaLabel,
    loading,
    suppressFieldCallbacks,
    className,
    ...props
}: MultipleSelectProps<T>) => {
    const [open, setOpen] = useState(false)

    const { i18n } = useUiContext()
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)

    // Records the blur on every close, because the popup holds the focus while it is open
    const onOpenChange = (
        newOpen: boolean,
        eventDetails: SelectPrimitive.Root.ChangeEventDetails,
    ) => {
        setOpen(newOpen)
        propOnOpenChange?.(newOpen, eventDetails)

        if (!newOpen) {
            callbacks.onBlur()
        }
    }
    const onTriggerBlur: NonNullable<
        ComponentProps<typeof SelectTrigger>["onBlur"]
    > = event => {
        if (open) {
            return
        }

        callbacks.onBlur(event)
    }

    if (mode === "view") {
        return (
            <InputView className={className}>
                {isDefined(propValue[0]) &&
                    (propValue.length === 1 ? (
                        <ItemComponent item={propValue[0]} position="trigger" />
                    ) : (
                        <div className="flex items-center gap-[0.75ch]">
                            <ItemComponent item={propValue[0]} position="trigger" />(
                            {i18n.t(
                                propValue.length - 1 === 1
                                    ? "Combobox.Chips.NMoreSingular"
                                    : "Combobox.Chips.NMorePlural",
                                { count: propValue.length - 1 },
                            )}
                            )
                        </div>
                    ))}
            </InputView>
        )
    }

    const placeholder = propPlaceholder ?? i18n.t("Combobox.Placeholder", undefined)

    const value = propValue.map(getItemId)
    const items = (() => {
        const propItemIds = propItems.map(getItemId)
        const currentItemIds = value

        const missingItemIds = new Set(difference(currentItemIds, propItemIds))
        if (missingItemIds.size === 0) {
            return propItems
        }

        return [
            ...propValue.filter(item => missingItemIds.has(getItemId(item))),
            ...propItems,
        ]
    })()

    const disabled = loading ? true : (propDisabled ?? !!fieldContext?.disabled)
    const id = propId ?? fieldContext?.inputId
    const error = !!fieldContext?.errors
    const ariaDescribedBy = propAriaDescribedBy ?? fieldContext?.describedByIds

    const onValueChange = (newValue: unknown) => {
        if (disabled) {
            return
        }

        const parsedNewValue = z.array(z.string()).safeParse(newValue)
        if (!parsedNewValue.success) {
            return
        }

        const newValueIds = new Set(parsedNewValue.data)
        const matchedItems = items.filter(item => newValueIds.has(getItemId(item)))
        propOnValueChange(matchedItems)
        callbacks.onChange()
    }
    const onReset = () => {
        if (disabled) {
            return
        }

        propOnValueChange([])
        callbacks.onChange()
    }

    const selectValueChildren = (selectValue: unknown) => {
        const parsedSelectValue = z.array(z.string()).safeParse(selectValue)
        if (!parsedSelectValue.success) {
            return undefined
        }

        if (parsedSelectValue.data.length === 0) {
            return placeholder
        }

        const selectValueIds = new Set(parsedSelectValue.data)
        const matchedItems = items.filter(item => selectValueIds.has(getItemId(item)))
        if (!isDefined(matchedItems[0])) {
            return undefined
        }

        if (matchedItems.length === 1) {
            return <ItemComponent item={matchedItems[0]} position="trigger" />
        }

        return (
            <div className="flex items-center gap-[0.75ch]">
                <ItemComponent item={matchedItems[0]} position="trigger" />(
                {i18n.t(`Combobox.Chips.NMore${i18nArity(matchedItems.length - 1)}`, {
                    count: matchedItems.length - 1,
                })}
                )
            </div>
        )
    }

    return (
        <SelectRoot
            value={value}
            onValueChange={onValueChange}
            open={open}
            onOpenChange={onOpenChange}
            disabled={disabled}
            {...props}
        >
            <SelectTrigger
                id={id}
                error={error}
                aria-describedby={ariaDescribedBy}
                aria-label={ariaLabel}
                onBlur={onTriggerBlur}
                className={cn(compositeMultipleSelectTriggerStyles(), className)}
            >
                {loading && <Spinner size="xs" />}
                {!loading && (
                    <SelectValue placeholder={placeholder}>
                        {selectValueChildren}
                    </SelectValue>
                )}
                {resettable && value.length > 0 && !disabled && (
                    <SelectReset onReset={onReset} />
                )}
                {(!resettable || value.length === 0) && !disabled && !loading && (
                    <SelectIcon rotate={open ? 180 : 0}>
                        <IconChevronDown />
                    </SelectIcon>
                )}
            </SelectTrigger>
            <SelectPortal>
                <SelectPositioner
                    side="bottom"
                    alignItemWithTrigger={false}
                    sideOffset={4}
                >
                    <SelectPopup>
                        {items.length === 0 && <SelectEmpty />}
                        <SelectScrollUpArrow />
                        <SelectList>
                            {items.map(item => {
                                const itemId = getItemId(item)

                                return (
                                    <SelectItem key={itemId} value={itemId}>
                                        <SelectItemText>
                                            <ItemComponent item={item} position="list" />
                                        </SelectItemText>
                                        <SelectItemIndicator>
                                            <IconCheck />
                                        </SelectItemIndicator>
                                    </SelectItem>
                                )
                            })}
                        </SelectList>
                        <SelectScrollDownArrow />
                    </SelectPopup>
                </SelectPositioner>
            </SelectPortal>
        </SelectRoot>
    )
}

export const Select = <T,>(props: SelectProps<T>) =>
    props.multiple ? <MultipleSelect {...props} /> : <SingleSelect {...props} />
