import { Autocomplete as AutocompletePrimitive } from "@base-ui/react"
import { omit } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import type { ComponentProps, ReactNode } from "react"
import type { StrictOmit } from "shared/types"
import type { ZodType } from "zod"

import {
    useFieldCallbacks,
    useFieldContext,
    useFieldInputMode,
} from "../field/field.context"
import { useUiContext } from "../i18n/ui-context"
import { Input, InputView } from "../input/input"
import { Spinner } from "../spinner/spinner"
import { normalizeBaseUiStyling } from "../styling/styling.helper"
import {
    autocompleteEmptyStyles,
    autocompleteInputStyles,
    autocompleteItemStyles,
    autocompleteListStyles,
    autocompletePopupStyles,
    autocompletePositionerStyles,
} from "./autocomplete.styles"

export const AutocompleteRoot = AutocompletePrimitive.Root
export const AutocompletePortal = AutocompletePrimitive.Portal

interface AutocompleteInputProps extends StrictOmit<
    ComponentProps<typeof AutocompletePrimitive.Input>,
    "render"
> {
    icon?: ReactNode
    iconSide?: "left" | "right"
    suppressFieldCallbacks?: boolean
}
export const AutocompleteInput = ({
    icon,
    iconSide,
    suppressFieldCallbacks,
    ...props
}: AutocompleteInputProps) => (
    <AutocompletePrimitive.Input
        render={({ className: renderPropClassName, ...renderProps }) => (
            <Input
                className={cn(autocompleteInputStyles(), renderPropClassName)}
                icon={icon}
                iconSide={iconSide}
                suppressFieldCallbacks={suppressFieldCallbacks}
                {...renderProps}
            />
        )}
        {...props}
    />
)

export const AutocompletePositioner = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof AutocompletePrimitive.Positioner>) => (
    <AutocompletePrimitive.Positioner
        className={state =>
            cn(
                autocompletePositionerStyles(),
                normalizeBaseUiStyling(propClassName, state),
            )
        }
        {...props}
    />
)

export const AutocompletePopup = ({
    className: propClassName,
    style: propStyle,
    ...props
}: ComponentProps<typeof AutocompletePrimitive.Popup>) => {
    const computedAutocompletePopupStyles = autocompletePopupStyles()
    return (
        <AutocompletePrimitive.Popup
            className={state =>
                cn(
                    computedAutocompletePopupStyles.className,
                    normalizeBaseUiStyling(propClassName, state),
                )
            }
            style={state => ({
                ...computedAutocompletePopupStyles.style,
                ...normalizeBaseUiStyling(propStyle, state),
            })}
            {...props}
        />
    )
}

export const AutocompleteEmpty = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof AutocompletePrimitive.Empty>) => {
    const { i18n } = useUiContext()
    const children =
        "children" in props ? props.children : i18n.t("Combobox.Empty", undefined)

    return (
        <AutocompletePrimitive.Empty
            className={state =>
                cn(
                    autocompleteEmptyStyles(),
                    normalizeBaseUiStyling(propClassName, state),
                )
            }
            {...omit(props, ["children"])}
        >
            {children}
        </AutocompletePrimitive.Empty>
    )
}

export const AutocompleteList = ({
    className: propClassName,
    ...props
}: ComponentProps<typeof AutocompletePrimitive.List>) => (
    <AutocompletePrimitive.List
        className={state =>
            cn(autocompleteListStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)

interface AutocompleteItemProps extends StrictOmit<
    ComponentProps<typeof AutocompletePrimitive.Item>,
    "value"
> {
    value?: string | number
}
export const AutocompleteItem = ({
    className: propClassName,
    ...props
}: AutocompleteItemProps) => (
    <AutocompletePrimitive.Item
        className={state =>
            cn(autocompleteItemStyles(), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    />
)

interface AutocompleteProps<T> extends StrictOmit<
    ComponentProps<typeof AutocompleteRoot>,
    "items" | "value"
> {
    itemSchema: ZodType<T>
    items: T[]
    value: T | string | undefined
    getItemId: (item: T) => string
    getItemValue: (item: T) => string
    renderItem: (props: { item: T }) => ReactNode
    id?: string
    className?: string
    loading?: boolean
    suppressFieldCallbacks?: boolean
}
export const Autocomplete = <T,>({
    itemSchema,
    items,
    value: propValue,
    getItemId,
    getItemValue,
    renderItem: ItemComponent,
    disabled: propDisabled,
    id: propId,
    className,
    loading,
    suppressFieldCallbacks,
    onValueChange: propOnValueChange,
    ...props
}: AutocompleteProps<T>) => {
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(suppressFieldCallbacks)

    const value = (() => {
        const parsed = itemSchema.safeParse(propValue)
        if (parsed.success) {
            return getItemId(parsed.data)
        }

        return typeof propValue === "string" ? propValue : undefined
    })()

    const disabled = loading ? true : (propDisabled ?? !!fieldContext?.disabled)
    const id = propId ?? fieldContext?.inputId

    if (mode === "view") {
        return (
            <InputView className={cn(autocompleteInputStyles(), className)}>
                {value}
            </InputView>
        )
    }

    const onValueChange: NonNullable<AutocompleteProps<T>["onValueChange"]> = (
        newValue,
        eventDetails,
    ) => {
        propOnValueChange?.(newValue, eventDetails)
        callbacks.onChange()
    }

    return (
        <AutocompleteRoot
            items={items}
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            {...props}
        >
            <AutocompleteInput
                id={id}
                className={className}
                icon={loading ? <Spinner size="xs" /> : undefined}
                iconSide="left"
                suppressFieldCallbacks={suppressFieldCallbacks}
            />
            <AutocompletePortal>
                <AutocompletePositioner sideOffset={4}>
                    <AutocompletePopup>
                        <AutocompleteEmpty />
                        <AutocompleteList>
                            {(option: unknown) => {
                                const parsedItem = itemSchema.safeParse(option)
                                if (!parsedItem.success) {
                                    return null
                                }

                                const itemId = getItemId(parsedItem.data)
                                const itemValue = getItemValue(parsedItem.data)

                                return (
                                    <AutocompleteItem key={itemId} value={itemValue}>
                                        <ItemComponent item={parsedItem.data} />
                                    </AutocompleteItem>
                                )
                            }}
                        </AutocompleteList>
                    </AutocompletePopup>
                </AutocompletePositioner>
            </AutocompletePortal>
        </AutocompleteRoot>
    )
}
