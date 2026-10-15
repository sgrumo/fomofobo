import { fullStyles, styles } from "frontend-shared/styles"
import { enforceType, isDefined } from "shared/values"

export const comboboxPositionerStyles = styles(() => "select-none")

export interface ComboboxTriggerStylesOpts {
    error: boolean
}
export const comboboxTriggerStyles = styles((opts: ComboboxTriggerStylesOpts) => [
    "tp-body-md bg-surface outline-line flex h-10 cursor-default items-center justify-between gap-2 rounded-lg p-2 outline-1 -outline-offset-1 transition-colors select-none disabled:cursor-not-allowed",
    {
        "focus-visible:outline-focus": !opts.error,
        "enabled:outline-danger": opts.error,
    },
])

export const comboboxCompositeTriggerStyles = styles(
    (opts: ComboboxTriggerStylesOpts) => [
        comboboxTriggerStyles(opts),
        "enabled:[&:hover:not(:has([data-combobox-reset]:hover))]:bg-surface-muted",
    ],
)

export const compositeComboboxTriggerStyles = styles(
    () => "flex items-center justify-between",
)

export const comboboxPlaceholderStyles = styles(() => "text-fg-subtle")

interface ComboboxIconStylesOpts {
    rotate: 0 | 180
}
export const comboboxIconStyles = styles((opts: ComboboxIconStylesOpts) => [
    "text-fg-muted flex transition-transform [&>svg]:size-4",
    { "rotate-180": opts.rotate === 180 },
])

export const comboboxInputContainerStyles = styles(
    () => "border-line-muted border-b p-2 [&>*]:w-full",
)

export const comboboxNavigationInputStyles = styles(() => "sr-only")

export const comboboxItemIndicatorStyles = styles(() => "text-fg-muted [&>svg]:size-4")

export const comboboxResetStyles = styles(
    () => "[&>svg]:text-fg-muted rounded-sm [&>svg]:size-4",
)

export const compositeMultipleComboboxTriggerStyles = styles(
    (opts: ComboboxTriggerStylesOpts) => [
        comboboxTriggerStyles(opts),
        "enabled:[&:hover:not(:has([data-combobox-reset]:hover))]:bg-surface-muted enabled:[&:hover:not(:has([data-combobox-reset]:hover))_[data-combobox-chip]]:bg-surface h-auto min-h-10 flex-wrap items-center",
    ],
)

export const comboboxChipsStyles = styles(
    () => "flex min-w-0 flex-1 flex-wrap items-center gap-1",
)

export const comboboxChipStyles = styles(
    () =>
        "tp-body-md bg-surface-muted text-fg flex items-center gap-1 rounded-md px-1.5 py-0.5 outline-none select-none",
)

export const comboboxChipRemoveStyles = styles(
    () => "[&>svg]:text-fg-muted flex cursor-default rounded [&>svg]:size-3.5",
)

interface ComboboxPopupStylesOpts {
    additionalWidth?: `${number}rem`
}
export const comboboxPopupStyles = fullStyles((opts: ComboboxPopupStylesOpts = {}) => ({
    className: [
        "shadow-hard-md flex max-h-[23rem] max-w-[var(--available-width)] flex-col overflow-hidden rounded-lg bg-surface outline-1 outline-line-muted",
        {
            "w-[calc(var(--anchor-width)+var(--custom-additional-width))]": isDefined(
                opts.additionalWidth,
            ),
            "w-[calc(var(--anchor-width))]": !isDefined(opts.additionalWidth),
        },
    ],
    style: enforceType<Partial<Record<string, string>>>({
        "--custom-additional-width": String(opts.additionalWidth ?? 0),
    }),
}))

export const comboboxStatusStyles = styles(
    () => "tp-body-md text-fg-muted self-center text-center not-empty:p-2",
)
export const comboboxEmptyStyles = comboboxStatusStyles

export const comboboxListStyles = styles(
    () => "min-h-0 flex-1 overflow-y-auto overscroll-contain",
)

export const comboboxItemStyles = styles(
    () =>
        "tp-body-md text-fg-muted data-[highlighted]:bg-surface-muted flex cursor-default items-center justify-between gap-2 p-2 outline-none select-none",
)
