import { styles } from "frontend-shared/styles"

import {
    comboboxEmptyStyles,
    comboboxItemStyles,
    comboboxListStyles,
    comboboxPopupStyles,
    comboboxPositionerStyles,
} from "../combobox/combobox.styles"

export const autocompleteInputStyles = styles(() => [
    // The default input padding moves here for full control. Unaccounted-for
    // padding makes the popup calculations output wrong results.
    "h-11 px-3 py-0",
    // The popup y position matches the input y position, so the input fills the
    // container height (see `input/input.tsx` for the input structure).
    "[&_input]:h-full",
])
export const autocompletePositionerStyles = comboboxPositionerStyles
export const autocompletePopupStyles = () =>
    comboboxPopupStyles({
        // Must match {px of the autocomplete input} * 2
        additionalWidth: "1.5rem",
    })
export const autocompleteEmptyStyles = comboboxEmptyStyles
export const autocompleteListStyles = comboboxListStyles
export const autocompleteItemStyles = comboboxItemStyles
