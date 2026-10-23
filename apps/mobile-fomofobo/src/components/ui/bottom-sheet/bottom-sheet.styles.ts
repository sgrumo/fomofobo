import { THEME_COLORS } from "@/lib/theme/theme-tokens"

export const bottomSheetBackgroundStyles = "flex-1"

export const bottomSheetContentStyles = "gap-3 px-4 pb-4"

export const bottomSheetHeaderStyles = "flex-row items-center justify-between gap-3"

export const bottomSheetTitleStyles = "flex-1"

// Floats 8 pt off the screen edges, as the web sheet
export const BOTTOM_SHEET_INSET = 8

export const bottomSheetModalStyle = { marginHorizontal: BOTTOM_SHEET_INSET }

export const bottomSheetHandleIndicator = {
    backgroundColor: THEME_COLORS["line-muted"],
    width: 40,
    height: 4,
    borderRadius: 0,
}

export const BOTTOM_SHEET_BACKDROP_OPACITY = 0.6
