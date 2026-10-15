import { cn } from "frontend-shared/styles"
import { useRef } from "react"
import type { ComponentProps } from "react"
import type { StrictOmit } from "shared/types"

import { useUiContext } from "../i18n/ui-context"
import { PixelIconClose, PixelIconSearch } from "../pixel-icons/pixel-icons"
import {
    searchFieldClearStyles,
    searchFieldCursorStyles,
    searchFieldIconStyles,
    searchFieldInputContainerStyles,
    searchFieldInputStyles,
    searchFieldPlaceholderStyles,
    searchFieldPlaceholderTextStyles,
    searchFieldRootStyles,
} from "./search-field.styles"

interface SearchFieldProps extends StrictOmit<
    ComponentProps<"input">,
    "type" | "value" | "defaultValue" | "onChange" | "className" | "aria-label" | "ref"
> {
    label: string
    value: string
    onValueChange: (value: string) => void
    className?: string
}
export const SearchField = ({
    label,
    value,
    onValueChange,
    placeholder,
    className,
    ...props
}: SearchFieldProps) => {
    const { i18n } = useUiContext()
    const inputRef = useRef<HTMLInputElement>(null)

    return (
        <div className={cn(searchFieldRootStyles(), className)}>
            <span className={searchFieldIconStyles()}>
                <PixelIconSearch />
            </span>
            <div className={searchFieldInputContainerStyles()}>
                <input
                    ref={inputRef}
                    type="search"
                    aria-label={label}
                    placeholder={placeholder}
                    value={value}
                    onChange={event => {
                        onValueChange(event.target.value)
                    }}
                    className={searchFieldInputStyles()}
                    {...props}
                />
                {value === "" && (
                    <span aria-hidden={true} className={searchFieldPlaceholderStyles()}>
                        <span className={searchFieldPlaceholderTextStyles()}>
                            {placeholder}
                        </span>
                        <span data-cursor={true} className={searchFieldCursorStyles()} />
                    </span>
                )}
            </div>
            {value !== "" && (
                <button
                    type="button"
                    aria-label={i18n.t("SearchField.Clear", undefined)}
                    onClick={() => {
                        onValueChange("")
                        inputRef.current?.focus()
                    }}
                    className={searchFieldClearStyles()}
                >
                    <PixelIconClose />
                </button>
            )}
        </div>
    )
}
