import { fullStyles, styles } from "frontend-shared/styles"
import { enforceType, isDefined } from "shared/values"

export const comboboxPositionerStyles = styles(() => "select-none")

export interface ComboboxTriggerStylesOpts {
    error: boolean
}
export const comboboxTriggerStyles = styles((opts: ComboboxTriggerStylesOpts) => [
    "tp-body-md bg-surface outline-line shadow-hard-sm flex h-11 cursor-default items-center justify-between gap-2 rounded-md px-3 py-2 outline-2 -outline-offset-2 transition-colors select-none disabled:cursor-not-allowed disabled:opacity-75",
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

export const comboboxPlaceholderStyles = styles(() => "text-fg-muted")

interface ComboboxIconStylesOpts {
    rotate: 0 | 180
}
export const comboboxIconStyles = styles((opts: ComboboxIconStylesOpts) => [
    "text-fg-muted flex transition-transform [&>svg]:size-4",
    { "rotate-180": opts.rotate === 180 },
])

export const comboboxInputContainerStyles = styles(
    () => "border-line border-b-2 p-2 [&>*]:w-full",
)

export const comboboxNavigationInputStyles = styles(() => "sr-only")

export const comboboxItemIndicatorStyles = styles(() => "text-fg [&>svg]:size-4")

export const comboboxResetStyles = styles(
    () => "[&>svg]:text-fg-muted rounded-sm [&>svg]:size-4",
)

export const compositeMultipleComboboxTriggerStyles = styles(
    (opts: ComboboxTriggerStylesOpts) => [
        comboboxTriggerStyles(opts),
        "enabled:[&:hover:not(:has([data-combobox-reset]:hover))]:bg-surface-muted enabled:[&:hover:not(:has([data-combobox-reset]:hover))_[data-combobox-chip]]:bg-surface h-auto min-h-11 flex-wrap items-center",
    ],
)

export const comboboxChipsStyles = styles(
    () => "flex min-w-0 flex-1 flex-wrap items-center gap-1",
)

export const comboboxChipStyles = styles(
    () =>
        "tp-pixel-sm bg-surface-muted text-fg outline-line flex items-center gap-1 rounded-sm px-1.5 py-0.5 outline-2 -outline-offset-2 select-none",
)

export const comboboxChipRemoveStyles = styles(
    () => "[&>svg]:text-fg-muted flex cursor-default rounded [&>svg]:size-3.5",
)

interface ComboboxPopupStylesOpts {
    additionalWidth?: `${number}rem`
}
export const comboboxPopupStyles = fullStyles((opts: ComboboxPopupStylesOpts = {}) => ({
    className: [
        "shadow-hard-md bg-surface outline-line flex max-h-[23rem] max-w-[var(--available-width)] flex-col overflow-hidden rounded-md outline-2 -outline-offset-2",
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
        "tp-body-md text-fg data-[highlighted]:bg-upcoming flex cursor-default items-center justify-between gap-2 px-3 py-2 outline-none select-none",
)
