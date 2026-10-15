import { fullStyles, styles } from "frontend-shared/styles"

import {
    comboboxEmptyStyles,
    comboboxItemStyles,
    comboboxListStyles,
    comboboxPopupStyles,
    comboboxPositionerStyles,
    comboboxTriggerStyles,
} from "../combobox/combobox.styles"
import type { ComboboxTriggerStylesOpts } from "../combobox/combobox.styles"

export const selectPositionerStyles = comboboxPositionerStyles
export const selectEmptyStyles = comboboxEmptyStyles
export const selectPopupStyles = fullStyles(() => {
    const base = comboboxPopupStyles()
    return { className: [base.className, "relative"], style: base.style }
})
export const selectListStyles = comboboxListStyles
export const selectItemStyles = comboboxItemStyles
export const selectTriggerStyles = styles((opts: ComboboxTriggerStylesOpts) => [
    comboboxTriggerStyles(opts),
    "enabled:[&:hover:not(:has([data-select-reset]:hover))]:bg-surface-muted",
])

export const selectValueStyles = styles(() => "data-[placeholder]:text-fg-muted")

interface SelectIconStylesOpts {
    rotate: 0 | 180
}
export const selectIconStyles = styles((opts: SelectIconStylesOpts) => [
    "text-fg-muted flex transition-transform [&>svg]:size-4",
    {
        "rotate-180": opts.rotate === 180,
    },
])

export const selectItemIndicatorStyles = styles(() => "text-fg [&>svg]:size-4")

export const selectItemTextStyles = styles(() => "text-fg")

export const selectScrollArrowStyles = styles((direction: "up" | "down") => [
    "bg-surface text-fg-muted absolute z-[1] flex h-4 w-full cursor-default items-center justify-center [&>svg]:size-4",
    {
        "top-0 [&>svg]:rotate-180": direction === "up",
        "bottom-0": direction === "down",
    },
])

const compositeSelectTriggerStyles = styles(() => "flex items-center justify-between")
export const compositeSingleSelectTriggerStyles = compositeSelectTriggerStyles
export const compositeMultipleSelectTriggerStyles = compositeSelectTriggerStyles

export const compositeSelectResetStyles = styles(
    () => "[&>svg]:text-fg-muted rounded-sm [&>svg]:size-4",
)
