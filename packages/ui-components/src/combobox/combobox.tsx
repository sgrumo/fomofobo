import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import type { BaseUIEvent } from "@base-ui/react"
import { useQuery } from "@tanstack/react-query"
import type { QueryObserverOptions } from "@tanstack/react-query"
import { clamp, difference, identity, omit } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import { useState } from "react"
import type {
    ChangeEvent,
    ComponentProps,
    KeyboardEvent,
    PointerEvent,
    ReactNode,
} from "react"
import { containEvent, useDebounced } from "react-shared"
import type { Require, StrictOmit } from "shared/types"
import { isDefined } from "shared/values"
import { match, P } from "ts-pattern"

import {
    useFieldCallbacks,
    useFieldContext,
    useFieldInputMode,
} from "../field/field.context"
import { useUiContext } from "../i18n/ui-context"
import { IconCheck, IconChevronDown, IconXMark } from "../icons/icons"
import { InputView } from "../input/input"
import {
    inputInputStyles,
    inputRootStyles,
    inputViewRootStyles,
} from "../input/input.styles"
import { Spinner } from "../spinner/spinner"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import {
    comboboxChipRemoveStyles,
    comboboxChipStyles,
    comboboxChipsStyles,
    comboboxCompositeTriggerStyles,
    comboboxEmptyStyles,
    comboboxIconStyles,
    comboboxInputContainerStyles,
    comboboxItemIndicatorStyles,
    comboboxItemStyles,
    comboboxListStyles,
    comboboxNavigationInputStyles,
    comboboxPopupStyles,
    comboboxPositionerStyles,
    comboboxResetStyles,
    comboboxPlaceholderStyles,
    compositeComboboxTriggerStyles,
    compositeMultipleComboboxTriggerStyles,
    comboboxStatusStyles,
} from "./combobox.styles"

export const ComboboxRoot = ComboboxPrimitive.Root
export const ComboboxPortal = ComboboxPrimitive.Portal
export const ComboboxValue = ComboboxPrimitive.Value
export const ComboboxLabel = ComboboxPrimitive.Label

interface ComboboxTriggerProps extends ComponentProps<typeof ComboboxPrimitive.Trigger> {
    error: boolean
}
export const ComboboxTrigger = ({ className, error, ...props }: ComboboxTriggerProps) => (
    <ComboboxPrimitive.Trigger
        className={state =>
            cn(
                comboboxCompositeTriggerStyles({ error }),
                normalizeBaseUiStyling(className, state),
            )
        }
        {...props}
    />
)

interface ComboboxIconProps extends ComponentProps<typeof ComboboxPrimitive.Icon> {
    rotate: 0 | 180
}
export const ComboboxIcon = ({ className, rotate, ...props }: ComboboxIconProps) => (
    <ComboboxPrimitive.Icon
        className={state =>
            cn(comboboxIconStyles({ rotate }), normalizeBaseUiStyling(className, state))
        }
        {...props}
    />
)

export const ComboboxPositioner = ({
    className,
    ...props
}: ComponentProps<typeof ComboboxPrimitive.Positioner>) => (
    <ComboboxPrimitive.Positioner
        className={state =>
            cn(comboboxPositionerStyles(), normalizeBaseUiStyling(className, state))
        }
        {...props}
    />
)

export const ComboboxPopup = ({
    className: propClassName,
    style: propStyle,
    ...props
}: ComponentProps<typeof ComboboxPrimitive.Popup>) => {
    const computedStyles = comboboxPopupStyles()
    const style: ComponentProps<typeof ComboboxPrimitive.Popup>["style"] = state => ({
        ...computedStyles.style,
        ...normalizeBaseUiStyling(propStyle, state),
    })
    return (
        <ComboboxPrimitive.Popup
            className={state =>
                cn(computedStyles.className, normalizeBaseUiStyling(propClassName, state))
            }
            style={style}
            {...props}
        />
    )
}

interface UncontrolledValueComboboxInputProps {
    controlled?: false
}
interface ControlledValueComboboxInputProps {
    controlled: true
    value: string | undefined
    onValueChange: (value: string | undefined) => void
}

interface BaseComboboxInputProps extends StrictOmit<
    ComponentProps<typeof ComboboxPrimitive.Input>,
    "size" | "type"
> {
    size?: "sm" | "md"
}

interface UncontrolledComboboxInputProps
    extends BaseComboboxInputProps, UncontrolledValueComboboxInputProps {}
interface ControlledComboboxInputProps
    extends
        StrictOmit<BaseComboboxInputProps, "value">,
        ControlledValueComboboxInputProps {}
type ComboboxInputProps = UncontrolledComboboxInputProps | ControlledComboboxInputProps

export const ComboboxInput = ({
    size = "md",
    className,
    onChange: propOnChange,
    ...props
}: ComboboxInputProps) => {
    const value = props.controlled ? (props.value ?? "") : undefined
    const onChange = props.controlled
        ? (event: BaseUIEvent<ChangeEvent<HTMLInputElement>>) => {
              propOnChange?.(event)
              props.onValueChange(
                  event.target.value === "" ? undefined : event.target.value,
              )
          }
        : propOnChange

    const inputProps = match(props)
        .with({ controlled: P.optional(false) }, matchedProps =>
            omit(matchedProps, ["controlled"]),
        )
        .with({ controlled: true }, matchedProps =>
            omit(matchedProps, ["controlled", "value", "onValueChange"]),
        )
        .exhaustive()

    return (
        <div
            className={cn(
                inputRootStyles({ size, disabled: false, error: false }),
                className,
            )}
        >
            <ComboboxPrimitive.Input
                className={inputInputStyles()}
                value={value}
                onChange={onChange}
                {...inputProps}
            />
        </div>
    )
}

const ComboboxNavigationInput = () => {
    const fieldContext = useFieldContext()

    return (
        <ComboboxPrimitive.Input
            readOnly={true}
            tabIndex={-1}
            aria-labelledby={fieldContext?.labelId}
            className={comboboxNavigationInputStyles()}
        />
    )
}

export const ComboboxStatus = ({
    className,
    ...props
}: ComponentProps<typeof ComboboxPrimitive.Status>) => (
    <ComboboxPrimitive.Status
        className={state =>
            cn(comboboxStatusStyles(), normalizeBaseUiStyling(className, state))
        }
        {...props}
    />
)

export const ComboboxEmpty = ({
    className,
    ...props
}: ComponentProps<typeof ComboboxPrimitive.Empty>) => (
    <ComboboxPrimitive.Empty
        className={state =>
            cn(comboboxEmptyStyles(), normalizeBaseUiStyling(className, state))
        }
        {...props}
    />
)

export const ComboboxList = ({
    className,
    ...props
}: ComponentProps<typeof ComboboxPrimitive.List>) => (
    <ComboboxPrimitive.List
        className={state =>
            cn(comboboxListStyles(), normalizeBaseUiStyling(className, state))
        }
        {...props}
    />
)

interface ComboboxItemProps extends StrictOmit<
    ComponentProps<typeof ComboboxPrimitive.Item>,
    "value"
> {
    value?: string | number
}
export const ComboboxItem = ({ className, ...props }: ComboboxItemProps) => (
    <ComboboxPrimitive.Item
        className={state =>
            cn(comboboxItemStyles(), normalizeBaseUiStyling(className, state))
        }
        {...props}
    />
)

export const ComboboxItemIndicator = ({
    className,
    ...props
}: ComponentProps<typeof ComboboxPrimitive.ItemIndicator>) => (
    <ComboboxPrimitive.ItemIndicator
        className={state =>
            cn(comboboxItemIndicatorStyles(), normalizeBaseUiStyling(className, state))
        }
        {...props}
    />
)

export const ComboboxChips = ({
    className,
    ...props
}: ComponentProps<typeof ComboboxPrimitive.Chips>) => (
    <ComboboxPrimitive.Chips
        className={state =>
            cn(comboboxChipsStyles(), normalizeBaseUiStyling(className, state))
        }
        {...props}
    />
)

export const ComboboxChip = ({
    className,
    ...props
}: ComponentProps<typeof ComboboxPrimitive.Chip>) => (
    <ComboboxPrimitive.Chip
        className={state =>
            cn(comboboxChipStyles(), normalizeBaseUiStyling(className, state))
        }
        data-combobox-chip={true}
        {...props}
    />
)

export const ComboboxChipRemove = ({
    className,
    onPointerDown: propOnPointerDown,
    ...props
}: ComponentProps<typeof ComboboxPrimitive.ChipRemove>) => {
    const { i18n } = useUiContext()

    const onPointerDown = (event: BaseUIEvent<PointerEvent<HTMLButtonElement>>) => {
        event.preventDefault()
        event.stopPropagation()
        propOnPointerDown?.(event)
    }

    return (
        <ComboboxPrimitive.ChipRemove
            render={
                <span
                    role="button"
                    aria-label={i18n.t("Combobox.Chips.Remove", undefined)}
                />
            }
            nativeButton={false}
            className={state =>
                cn(comboboxChipRemoveStyles(), normalizeBaseUiStyling(className, state))
            }
            onPointerDown={onPointerDown}
            {...props}
        />
    )
}

interface ComboboxPlaceholderProps {
    placeholder: string
}
const ComboboxPlaceholder = (props: ComboboxPlaceholderProps) => (
    <span className={comboboxPlaceholderStyles()}>{props.placeholder}</span>
)

interface ComboboxResetProps {
    onReset: () => void
    ariaLabel: string
}
const ComboboxReset = (props: ComboboxResetProps) => {
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
            aria-label={props.ariaLabel}
            className={comboboxResetStyles()}
            onPointerDown={onPointerDown}
            onKeyDown={onKeyDown}
            onMouseDown={containEvent}
            onClick={containEvent}
            tabIndex={-1}
            data-combobox-reset={true}
        >
            <IconXMark />
        </span>
    )
}

interface BaseSyncComboboxProps {
    async: false
    resettable: boolean
}
interface StandardSyncComboboxProps extends BaseSyncComboboxProps {
    searchable?: boolean
}

interface BaseAsyncComboboxProps {
    async: true
    resettable: boolean
    minimumSearchLength: number
}
interface StandardAsyncComboboxProps extends BaseAsyncComboboxProps {
    fetching: boolean
    search: string
    onSearchChange: (search: string) => void
}
type QueryAsyncComboboxProps = BaseAsyncComboboxProps

type AsyncStatus =
    | {
          fetching: true
      }
    | {
          fetching: false
          minimumSearchLengthSatisfied: boolean
          minimumSearchLength: number
      }

/**
 * @description Returns the fetch state of an async combobox and its search length gate
 * @param props Async props holding the fetch flag, the search, and the minimum length
 * @remarks Clamps `minimumSearchLength` to `1` as the lower bound
 */
const getAsyncStatus = (props: StandardAsyncComboboxProps) =>
    match({
        ...props,
        minimumSearchLength: clamp(props.minimumSearchLength, 1, Infinity),
    })
        .returnType<AsyncStatus>()
        .with({ fetching: true }, () => ({ fetching: true }))
        .when(
            asyncProps => asyncProps.search.length < asyncProps.minimumSearchLength,
            asyncProps => ({
                fetching: false,
                minimumSearchLengthSatisfied: false,
                minimumSearchLength: asyncProps.minimumSearchLength,
            }),
        )
        .otherwise(asyncProps => ({
            fetching: false,
            minimumSearchLengthSatisfied: true,
            minimumSearchLength: asyncProps.minimumSearchLength,
        }))

interface ComboboxAsyncStatusProps {
    status: AsyncStatus
}
const ComboboxAsyncStatus = (props: ComboboxAsyncStatusProps) => {
    const { i18n } = useUiContext()

    const content = match(props.status)
        .with({ fetching: true }, () => (
            <Spinner size="xs" title={i18n.t("Combobox.Loading", undefined)} />
        ))
        .when(
            matchedStatus =>
                !matchedStatus.minimumSearchLengthSatisfied &&
                matchedStatus.minimumSearchLength === 1,
            () => (
                <span>{i18n.t("Combobox.Search.Prompt.NoMinimumLength", undefined)}</span>
            ),
        )
        .when(
            matchedStatus =>
                !matchedStatus.minimumSearchLengthSatisfied &&
                matchedStatus.minimumSearchLength > 1,
            asyncProps => (
                <span>
                    {i18n.t("Combobox.Search.Prompt.MinimumLength", {
                        minLength: asyncProps.minimumSearchLength,
                    })}
                </span>
            ),
        )
        .otherwise(() => null)

    if (content === null) {
        return null
    }

    return <ComboboxStatus>{content}</ComboboxStatus>
}

interface BaseComboboxProps<T> extends StrictOmit<
    ComponentProps<typeof ComboboxRoot>,
    | "items"
    | "value"
    | "onValueChange"
    | "open"
    | "multiple"
    | "filter"
    | "filteredItems"
    | "isItemEqualToValue"
    | "defaultValue"
> {
    getItemId: (item: NoInfer<T>) => string
    getItemLabel: (item: NoInfer<T>) => string
    renderItem: (props: { item: NoInfer<T>; position: "trigger" | "list" }) => ReactNode
    placeholder?: string
    id?: string
    className?: string
    suppressFieldCallbacks?: boolean
    "aria-describedby"?: string
    "aria-label"?: string
}

interface BaseStandardComboboxProps<T> extends BaseComboboxProps<T> {
    items: T[]
    type: "standard"
    loading?: boolean
}

interface BaseQueryComboboxProps<T> extends BaseComboboxProps<T> {
    type: "query"
}

interface BaseQuerySyncComboboxProps<T, D>
    extends BaseQueryComboboxProps<T>, BaseSyncComboboxProps {
    query: Require<
        QueryObserverOptions<D, unknown, T[]>,
        "queryFn" | "queryKey" | "select"
    >
    searchable?: boolean
}

interface BaseQueryAsyncComboboxProps<T, D>
    extends BaseQueryComboboxProps<T>, QueryAsyncComboboxProps {
    query: (
        search: string | undefined,
    ) => Require<QueryObserverOptions<D, unknown, T[]>, "queryFn" | "queryKey" | "select">
    debounceDelay?: number
}

interface SingleComboboxValueProps<T> {
    multiple: false
    value: NoInfer<T> | undefined
    onValueChange: (value: NoInfer<T> | undefined) => void
}

interface MultipleComboboxValueProps<T> {
    multiple: true
    value: Array<NoInfer<T>>
    onValueChange: (value: Array<NoInfer<T>>) => void
}

interface SyncStandardSingleComboboxProps<T>
    extends
        BaseStandardComboboxProps<T>,
        SingleComboboxValueProps<T>,
        StandardSyncComboboxProps {}
interface AsyncStandardSingleComboboxProps<T>
    extends
        BaseStandardComboboxProps<T>,
        SingleComboboxValueProps<T>,
        StandardAsyncComboboxProps {}
type SingleStandardComboboxProps<T> =
    | SyncStandardSingleComboboxProps<T>
    | AsyncStandardSingleComboboxProps<T>

interface SyncStandardMultipleComboboxProps<T>
    extends
        BaseStandardComboboxProps<T>,
        MultipleComboboxValueProps<T>,
        StandardSyncComboboxProps {}
interface AsyncStandardMultipleComboboxProps<T>
    extends
        BaseStandardComboboxProps<T>,
        MultipleComboboxValueProps<T>,
        StandardAsyncComboboxProps {}
type MultipleStandardComboboxProps<T> =
    | SyncStandardMultipleComboboxProps<T>
    | AsyncStandardMultipleComboboxProps<T>

type StandardComboboxProps<T> =
    | SingleStandardComboboxProps<T>
    | MultipleStandardComboboxProps<T>

const SingleCombobox = <T,>({
    items: propItems,
    getItemId,
    getItemLabel,
    renderItem: ItemComponent,
    placeholder: propPlaceholder,
    value: propValue,
    onValueChange: propOnValueChange,
    disabled: propDisabled,
    id: propId,
    "aria-describedby": propAriaDescribedBy,
    "aria-label": ariaLabel,
    onOpenChange: propOnOpenChange,
    onOpenChangeComplete: propOnOpenChangeComplete,
    loading,
    suppressFieldCallbacks,
    className,
    ...props
}: SingleStandardComboboxProps<T>) => {
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)
    const [open, setOpen] = useState(false)

    // Records the blur on every close, because the popup holds the focus while it is open
    const onOpenChange = (
        newOpen: boolean,
        eventDetails: ComboboxPrimitive.Root.ChangeEventDetails,
    ) => {
        setOpen(newOpen)
        propOnOpenChange?.(newOpen, eventDetails)

        if (!newOpen) {
            callbacks.onBlur()
        }
    }
    const onTriggerBlur: NonNullable<
        ComponentProps<typeof ComboboxTrigger>["onBlur"]
    > = event => {
        if (open) {
            return
        }

        callbacks.onBlur(event)
    }

    const { i18n } = useUiContext()
    const { contains } = ComboboxPrimitive.useFilter()

    const searchable =
        props.async || !isDefined(props.searchable) ? true : props.searchable
    const placeholder = propPlaceholder ?? i18n.t("Combobox.Placeholder", undefined)

    const [items, allItems] = (() => {
        if (!isDefined(propValue)) {
            return [propItems, propItems]
        }

        const currentValueId = getItemId(propValue)
        const itemsWithCurrent = propItems.some(
            item => getItemId(item) === currentValueId,
        )
            ? propItems
            : [propValue, ...propItems]

        return [props.async ? propItems : itemsWithCurrent, itemsWithCurrent]
    })()

    const itemById = new Map(allItems.map(item => [getItemId(item), item]))
    const itemIds = items.map(getItemId)
    const value = isDefined(propValue) ? getItemId(propValue) : null

    const disabled = loading ? true : (propDisabled ?? !!fieldContext?.disabled)
    const id = propId ?? fieldContext?.inputId
    const error = !!fieldContext?.errors
    const ariaDescribedBy = propAriaDescribedBy ?? fieldContext?.describedByIds

    if (mode === "view") {
        return (
            <InputView className={className}>
                {isDefined(propValue) && (
                    <ItemComponent item={propValue} position="trigger" />
                )}
            </InputView>
        )
    }

    const onValueChange = (newValue: unknown) => {
        if (disabled) {
            return
        }

        if (typeof newValue !== "string") {
            propOnValueChange(undefined)
            callbacks.onChange()
            return
        }

        propOnValueChange(itemById.get(newValue))
        callbacks.onChange()
    }
    const onReset = () => {
        if (disabled) {
            return
        }

        propOnValueChange(undefined)
        callbacks.onChange()
    }

    const filter = (itemId: string, query: string) => {
        if (props.async) {
            return true
        }

        const item = itemById.get(itemId)
        return isDefined(item) ? contains(item, query, getItemLabel) : false
    }

    const valueChildren = (itemId: unknown) => {
        if (typeof itemId !== "string") {
            return disabled ? null : <ComboboxPlaceholder placeholder={placeholder} />
        }

        const item = itemById.get(itemId)
        if (!isDefined(item)) {
            return disabled ? null : <ComboboxPlaceholder placeholder={placeholder} />
        }

        return <ItemComponent item={item} position="trigger" />
    }

    const asyncStatus = props.async ? getAsyncStatus(props) : null
    const showList =
        !asyncStatus ||
        (!asyncStatus.fetching && asyncStatus.minimumSearchLengthSatisfied)

    const renderListItem = (itemId: unknown) => {
        if (typeof itemId !== "string" || !showList) {
            return null
        }

        const item = itemById.get(itemId)
        if (!isDefined(item)) {
            return null
        }

        return (
            <ComboboxItem key={itemId} value={itemId}>
                <ItemComponent item={item} position="list" />
                <ComboboxItemIndicator>
                    <IconCheck />
                </ComboboxItemIndicator>
            </ComboboxItem>
        )
    }

    const onSearchChange = (search: string | undefined) => {
        if (!props.async) {
            return
        }

        props.onSearchChange(search ?? "")
    }

    const onOpenChangeComplete = (newOpen: boolean) => {
        propOnOpenChangeComplete?.(newOpen)

        if (props.async) {
            props.onSearchChange("")
        }
    }

    const rootProps = match(props)
        .with({ async: P.optional(false) }, matchedProps =>
            omit(matchedProps, ["async", "resettable"]),
        )
        .with({ async: true }, matchedProps =>
            omit(matchedProps, [
                "async",
                "resettable",
                "fetching",
                "search",
                "onSearchChange",
            ]),
        )
        .exhaustive()

    return (
        <ComboboxRoot
            items={itemIds}
            value={value}
            onValueChange={onValueChange}
            open={open}
            onOpenChange={onOpenChange}
            onOpenChangeComplete={onOpenChangeComplete}
            filter={searchable ? filter : null}
            disabled={disabled}
            {...rootProps}
        >
            <ComboboxTrigger
                id={id}
                error={error}
                aria-describedby={ariaDescribedBy}
                aria-label={ariaLabel}
                onBlur={onTriggerBlur}
                className={cn(compositeComboboxTriggerStyles(), className)}
            >
                {loading && <Spinner size="xs" />}
                {!loading && <ComboboxValue>{valueChildren}</ComboboxValue>}
                {props.resettable && isDefined(propValue) && !disabled && (
                    <ComboboxReset
                        onReset={onReset}
                        ariaLabel={i18n.t("Combobox.Reset", undefined)}
                    />
                )}
                {(!props.resettable || !isDefined(propValue)) &&
                    !disabled &&
                    !loading && (
                        <ComboboxIcon rotate={open ? 180 : 0}>
                            <IconChevronDown />
                        </ComboboxIcon>
                    )}
            </ComboboxTrigger>
            <ComboboxPortal>
                <ComboboxPositioner sideOffset={4}>
                    <ComboboxPopup>
                        {searchable && (
                            <div className={comboboxInputContainerStyles()}>
                                {!props.async && (
                                    <ComboboxInput
                                        size="sm"
                                        placeholder={i18n.t(
                                            "Combobox.Search.Placeholder",
                                            undefined,
                                        )}
                                    />
                                )}
                                {props.async && (
                                    <ComboboxInput
                                        controlled={true}
                                        value={props.search}
                                        onValueChange={onSearchChange}
                                        size="sm"
                                        placeholder={i18n.t(
                                            "Combobox.Search.Placeholder",
                                            undefined,
                                        )}
                                    />
                                )}
                            </div>
                        )}
                        {!searchable && <ComboboxNavigationInput />}
                        {asyncStatus && <ComboboxAsyncStatus status={asyncStatus} />}
                        {showList && (
                            <ComboboxEmpty>
                                {i18n.t("Combobox.Empty", undefined)}
                            </ComboboxEmpty>
                        )}
                        <ComboboxList>{renderListItem}</ComboboxList>
                    </ComboboxPopup>
                </ComboboxPositioner>
            </ComboboxPortal>
        </ComboboxRoot>
    )
}

const MultipleCombobox = <T,>({
    items: propItems,
    getItemId,
    getItemLabel,
    renderItem: ItemComponent,
    placeholder: propPlaceholder,
    value: propValue,
    onValueChange: propOnValueChange,
    disabled: propDisabled,
    id: propId,
    "aria-describedby": propAriaDescribedBy,
    "aria-label": ariaLabel,
    onOpenChange: propOnOpenChange,
    onOpenChangeComplete: propOnOpenChangeComplete,
    loading,
    suppressFieldCallbacks,
    className,
    ...props
}: MultipleStandardComboboxProps<T>) => {
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)

    const [open, setOpen] = useState(false)

    // Records the blur on every close, because the popup holds the focus while it is open
    const onOpenChange = (
        newOpen: boolean,
        eventDetails: ComboboxPrimitive.Root.ChangeEventDetails,
    ) => {
        setOpen(newOpen)
        propOnOpenChange?.(newOpen, eventDetails)

        if (!newOpen) {
            callbacks.onBlur()
        }
    }
    const onTriggerBlur: NonNullable<
        ComponentProps<typeof ComboboxTrigger>["onBlur"]
    > = event => {
        if (open) {
            return
        }

        callbacks.onBlur(event)
    }

    const { i18n } = useUiContext()
    const { contains } = ComboboxPrimitive.useFilter()

    const searchable =
        props.async || !isDefined(props.searchable) ? true : props.searchable
    const placeholder = propPlaceholder ?? i18n.t("Combobox.Placeholder", undefined)

    const [items, allItems] = (() => {
        const propItemIds = propItems.map(getItemId)
        const currentItemIds = propValue.map(getItemId)

        const missingItemIds = new Set(difference(currentItemIds, propItemIds))
        if (missingItemIds.size === 0) {
            return [propItems, propItems]
        }

        const itemsWithCurrent = [
            ...propValue.filter(item => missingItemIds.has(getItemId(item))),
            ...propItems,
        ]
        return [props.async ? propItems : itemsWithCurrent, itemsWithCurrent]
    })()

    const itemById = new Map(allItems.map(item => [getItemId(item), item]))
    const itemIds = items.map(getItemId)

    const disabled = loading ? true : (propDisabled ?? !!fieldContext?.disabled)
    const id = propId ?? fieldContext?.inputId
    const error = !!fieldContext?.errors
    const ariaDescribedBy = propAriaDescribedBy ?? fieldContext?.describedByIds

    if (mode === "view") {
        return (
            <div
                className={cn(
                    inputViewRootStyles({ size: "md", forceSquare: false }),
                    "h-auto min-h-10 flex-wrap",
                    className,
                )}
            >
                <span className={comboboxChipsStyles()}>
                    {propValue.map(item => (
                        <span key={getItemId(item)} className={comboboxChipStyles()}>
                            <ItemComponent item={item} position="trigger" />
                        </span>
                    ))}
                </span>
            </div>
        )
    }

    const onReset = () => {
        if (disabled) {
            return
        }

        propOnValueChange([])
        callbacks.onChange()
    }
    const onValueChange = (newValueRaw: unknown) => {
        if (disabled || !Array.isArray(newValueRaw)) {
            return
        }

        const newValue = newValueRaw.flatMap(itemId => {
            if (typeof itemId !== "string") {
                return []
            }
            const item = itemById.get(itemId)
            return isDefined(item) ? [item] : []
        })
        propOnValueChange(newValue)
        callbacks.onChange()
    }

    const filter = (itemId: string, query: string) => {
        if (props.async) {
            return true
        }

        const item = itemById.get(itemId)
        return isDefined(item) ? contains(item, query, getItemLabel) : false
    }

    const asyncStatus = props.async ? getAsyncStatus(props) : null
    const showList =
        !asyncStatus ||
        (!asyncStatus.fetching && asyncStatus.minimumSearchLengthSatisfied)

    const valueChildren = (rawFilteredItems: unknown) => {
        if (!Array.isArray(rawFilteredItems) || rawFilteredItems.length === 0) {
            return disabled ? null : <ComboboxPlaceholder placeholder={placeholder} />
        }

        const filteredItems = rawFilteredItems.flatMap(itemId => {
            if (typeof itemId !== "string") {
                return []
            }
            const item = itemById.get(itemId)
            return isDefined(item) ? [[item, itemId] as const] : []
        })
        return filteredItems.map(([item, itemId]) => (
            <ComboboxChip key={itemId}>
                <ItemComponent item={item} position="trigger" />
                {!disabled && (
                    <ComboboxChipRemove>
                        <IconXMark />
                    </ComboboxChipRemove>
                )}
            </ComboboxChip>
        ))
    }

    const renderListItem = (itemId: unknown) => {
        if (typeof itemId !== "string" || !showList) {
            return null
        }

        const item = itemById.get(itemId)
        if (!isDefined(item)) {
            return null
        }

        return (
            <ComboboxItem key={itemId} value={itemId}>
                <ItemComponent item={item} position="list" />
                <ComboboxItemIndicator>
                    <IconCheck />
                </ComboboxItemIndicator>
            </ComboboxItem>
        )
    }

    const onSearchChange = (search: string | undefined) => {
        if (!props.async) {
            return
        }

        props.onSearchChange(search ?? "")
    }

    const onOpenChangeComplete = (newOpen: boolean) => {
        propOnOpenChangeComplete?.(newOpen)

        if (props.async) {
            props.onSearchChange("")
        }
    }

    const rootProps = match(props)
        .with({ async: P.optional(false) }, matchedProps =>
            omit(matchedProps, ["async", "resettable"]),
        )
        .with({ async: true }, matchedProps =>
            omit(matchedProps, [
                "async",
                "resettable",
                "fetching",
                "search",
                "onSearchChange",
            ]),
        )
        .exhaustive()

    return (
        <ComboboxRoot
            items={itemIds}
            value={propValue.map(getItemId)}
            onValueChange={onValueChange}
            open={open}
            onOpenChange={onOpenChange}
            onOpenChangeComplete={onOpenChangeComplete}
            filter={searchable ? filter : null}
            disabled={disabled}
            {...rootProps}
        >
            <ComboboxTrigger
                id={id}
                error={error}
                aria-describedby={ariaDescribedBy}
                aria-label={ariaLabel}
                onBlur={onTriggerBlur}
                className={cn(
                    compositeMultipleComboboxTriggerStyles({ error }),
                    className,
                )}
            >
                {loading && <Spinner size="xs" />}
                {!loading && (
                    <ComboboxChips>
                        <ComboboxValue>{valueChildren}</ComboboxValue>
                    </ComboboxChips>
                )}
                {props.resettable && propValue.length > 0 && !disabled && (
                    <ComboboxReset
                        onReset={onReset}
                        ariaLabel={i18n.t("Combobox.Reset", undefined)}
                    />
                )}
                {(!props.resettable || propValue.length === 0) &&
                    !disabled &&
                    !loading && (
                        <ComboboxIcon rotate={open ? 180 : 0}>
                            <IconChevronDown />
                        </ComboboxIcon>
                    )}
            </ComboboxTrigger>
            <ComboboxPortal>
                <ComboboxPositioner sideOffset={4}>
                    <ComboboxPopup>
                        {searchable && (
                            <div className={comboboxInputContainerStyles()}>
                                {!props.async && (
                                    <ComboboxInput
                                        size="sm"
                                        placeholder={i18n.t(
                                            "Combobox.Search.Placeholder",
                                            undefined,
                                        )}
                                    />
                                )}
                                {props.async && (
                                    <ComboboxInput
                                        controlled={true}
                                        value={props.search}
                                        onValueChange={onSearchChange}
                                        size="sm"
                                        placeholder={i18n.t(
                                            "Combobox.Search.Placeholder",
                                            undefined,
                                        )}
                                    />
                                )}
                            </div>
                        )}
                        {!searchable && <ComboboxNavigationInput />}
                        {asyncStatus && <ComboboxAsyncStatus status={asyncStatus} />}
                        {showList && (
                            <ComboboxEmpty>
                                {i18n.t("Combobox.Empty", undefined)}
                            </ComboboxEmpty>
                        )}
                        <ComboboxList>{renderListItem}</ComboboxList>
                    </ComboboxPopup>
                </ComboboxPositioner>
            </ComboboxPortal>
        </ComboboxRoot>
    )
}

const StandardCombobox = <T,>(props: StandardComboboxProps<T>) =>
    props.multiple ? <MultipleCombobox {...props} /> : <SingleCombobox {...props} />

interface SyncQuerySingleComboboxProps<T, D>
    extends BaseQuerySyncComboboxProps<T, D>, SingleComboboxValueProps<T> {}
interface AsyncQuerySingleComboboxProps<T, D>
    extends
        BaseQueryAsyncComboboxProps<T, D>,
        SingleComboboxValueProps<T>,
        QueryAsyncComboboxProps {}
type SingleQueryComboboxProps<T, D> =
    | SyncQuerySingleComboboxProps<T, D>
    | AsyncQuerySingleComboboxProps<T, D>

interface SyncQueryMultipleComboboxProps<T, D>
    extends BaseQuerySyncComboboxProps<T, D>, MultipleComboboxValueProps<T> {}
interface AsyncQueryMultipleComboboxProps<T, D>
    extends
        BaseQueryAsyncComboboxProps<T, D>,
        MultipleComboboxValueProps<T>,
        QueryAsyncComboboxProps {}
type MultipleQueryComboboxProps<T, D> =
    | SyncQueryMultipleComboboxProps<T, D>
    | AsyncQueryMultipleComboboxProps<T, D>

type QueryComboboxProps<T, D> =
    | SingleQueryComboboxProps<T, D>
    | MultipleQueryComboboxProps<T, D>

export const QueryCombobox = <T, D>({ type: _, ...props }: QueryComboboxProps<T, D>) => {
    const [search, setSearch] = useState<string>("")

    const debounceDelay = props.async ? props.debounceDelay : "none"
    const [debouncedSearch, isDebouncing] = useDebounced(search, identity, debounceDelay)

    const minimumSearchLength = props.async
        ? clamp(props.minimumSearchLength, 1, Infinity)
        : 0

    const query = props.async ? props.query(debouncedSearch) : props.query
    const queryEnabled = props.async
        ? debouncedSearch.length >= minimumSearchLength
        : true

    const { data, isLoading, isFetching } = useQuery({ ...query, enabled: queryEnabled })
    const items = data ?? []

    const fetching = props.async
        ? isFetching || (isDebouncing && search.length >= minimumSearchLength)
        : false

    return props.async ? (
        <StandardCombobox
            type="standard"
            loading={false}
            items={items}
            search={search}
            onSearchChange={setSearch}
            fetching={fetching}
            {...props}
        />
    ) : (
        <StandardCombobox type="standard" loading={isLoading} items={items} {...props} />
    )
}

export type ComboboxProps<T, D = T[]> =
    | StandardComboboxProps<T>
    | QueryComboboxProps<T, D>

export const Combobox = <T, D = T[]>(props: ComboboxProps<T, D>) =>
    props.type === "standard" ? (
        <StandardCombobox {...props} />
    ) : (
        <QueryCombobox {...props} />
    )
