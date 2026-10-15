import { fullStyles, styles } from "frontend-shared/styles"
import { enforceType, isDefined } from "shared/values"

export const comboboxPositionerStyles = styles(() => "select-none")

export interface ComboboxTriggerStylesOpts {
    error: boolean
}
export const comboboxTriggerStyles = styles((opts: ComboboxTriggerStylesOpts) => [
    "tp-b2-regular flex h-10 cursor-default items-center justify-between gap-2 rounded-lg bg-white p-2 outline-1 -outline-offset-1 outline-neutral-400 transition-colors select-none disabled:cursor-not-allowed dark:bg-neutral-900 dark:outline-neutral-600",
    {
        "focus-visible:outline-primary-600 dark:focus-visible:outline-primary-300":
            !opts.error,
        "enabled:outline-danger-600 dark:enabled:outline-danger-400": opts.error,
    },
])

export const comboboxCompositeTriggerStyles = styles(
    (opts: ComboboxTriggerStylesOpts) => [
        comboboxTriggerStyles(opts),
        "enabled:[&:hover:not(:has([data-combobox-reset]:hover))]:bg-neutral-100 dark:enabled:[&:hover:not(:has([data-combobox-reset]:hover))]:bg-neutral-800",
    ],
)

export const compositeComboboxTriggerStyles = styles(
    () => "flex items-center justify-between",
)

export const comboboxPlaceholderStyles = styles(
    () => "text-neutral-400 dark:text-neutral-500",
)

interface ComboboxIconStylesOpts {
    rotate: 0 | 180
}
export const comboboxIconStyles = styles((opts: ComboboxIconStylesOpts) => [
    "flex text-neutral-500 transition-transform dark:text-neutral-400 [&>svg]:size-4",
    { "rotate-180": opts.rotate === 180 },
])

export const comboboxInputContainerStyles = styles(
    () => "border-b border-neutral-200 p-2 dark:border-neutral-700 [&>*]:w-full",
)

export const comboboxNavigationInputStyles = styles(() => "sr-only")

export const comboboxItemIndicatorStyles = styles(
    () => "text-neutral-600 dark:text-neutral-300 [&>svg]:size-4",
)

export const comboboxResetStyles = styles(
    () =>
        "rounded-sm [&>svg]:size-4 [&>svg]:text-neutral-600 dark:[&>svg]:text-neutral-300",
)

export const compositeMultipleComboboxTriggerStyles = styles(
    (opts: ComboboxTriggerStylesOpts) => [
        comboboxTriggerStyles(opts),
        "h-auto min-h-10 flex-wrap items-center enabled:[&:hover:not(:has([data-combobox-reset]:hover))]:bg-neutral-100 dark:enabled:[&:hover:not(:has([data-combobox-reset]:hover))]:bg-neutral-800 enabled:[&:hover:not(:has([data-combobox-reset]:hover))_[data-combobox-chip]]:bg-white dark:enabled:[&:hover:not(:has([data-combobox-reset]:hover))_[data-combobox-chip]]:bg-neutral-900",
    ],
)

export const comboboxChipsStyles = styles(
    () => "flex min-w-0 flex-1 flex-wrap items-center gap-1",
)

export const comboboxChipStyles = styles(
    () =>
        "tp-b2-regular flex items-center gap-1 rounded-md bg-neutral-100 px-1.5 py-0.5 text-neutral-700 outline-none select-none dark:bg-neutral-800 dark:text-neutral-200",
)

export const comboboxChipRemoveStyles = styles(
    () =>
        "flex cursor-default rounded [&>svg]:size-3.5 [&>svg]:text-neutral-500 dark:[&>svg]:text-neutral-400",
)

interface ComboboxPopupStylesOpts {
    additionalWidth?: `${number}rem`
}
export const comboboxPopupStyles = fullStyles((opts: ComboboxPopupStylesOpts = {}) => ({
    className: [
        "shadow-300 dark:shadow-none flex max-h-[23rem] max-w-[var(--available-width)] flex-col overflow-hidden rounded-lg bg-white dark:bg-neutral-900 outline-1 outline-neutral-200 dark:outline-neutral-700",
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
    () =>
        "tp-b2-regular self-center text-center text-neutral-600 not-empty:p-2 dark:text-neutral-300",
)
export const comboboxEmptyStyles = comboboxStatusStyles

export const comboboxListStyles = styles(
    () => "min-h-0 flex-1 overflow-y-auto overscroll-contain",
)

export const comboboxItemStyles = styles(
    () =>
        "tp-b2-regular flex cursor-default items-center justify-between gap-2 p-2 text-neutral-600 outline-none select-none data-[highlighted]:bg-neutral-100 dark:text-neutral-300 dark:data-[highlighted]:bg-neutral-800",
)
