import { steps } from "react-native-reanimated"

import { THEME_COLORS } from "@/lib/theme/theme-tokens"

export const searchFieldStyles = "min-h-11 flex-row items-center gap-2.5 px-2.5"

export const searchFieldInputContainerStyles = "min-w-0 flex-1 justify-center"

// The `pixel-md` type with no line height: a line height shifts the text of an iOS `TextInput` off center
export const searchFieldInputStyles =
    "py-2 font-display text-[13px] uppercase tracking-[0.78px] text-fg"

export const searchFieldPlaceholderStyles = "absolute inset-0 flex-row items-center gap-1"

export const searchFieldPlaceholderTextStyles = "shrink"

// The block cursor of the web field, on for half of each second
export const searchFieldCursorStyle = {
    width: 8,
    height: 14,
    backgroundColor: THEME_COLORS.live,
    animationName: { from: { opacity: 1 }, "50%": { opacity: 0 }, to: { opacity: 1 } },
    animationDuration: 1000,
    animationIterationCount: "infinite",
    animationTimingFunction: steps(1),
}

export const SEARCH_FIELD_ICON_SIZE = 16

export const SEARCH_FIELD_CLEAR_ICON_SIZE = 12

// Brings the 20 pt clear control to the 44 pt target
export const SEARCH_FIELD_CLEAR_HIT_SLOP = 12

export const searchFieldClearStyles = "rounded-sm p-1"
