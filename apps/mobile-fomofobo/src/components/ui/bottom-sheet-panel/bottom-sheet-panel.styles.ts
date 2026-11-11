import { BOTTOM_SHEET_INSET } from "@/components/ui/bottom-sheet/bottom-sheet.styles"

export const bottomSheetPanelContentStyles = "gap-3 px-4 pb-4"

export const bottomSheetPanelStyle = { marginHorizontal: BOTTOM_SHEET_INSET }

// Holds the tab above the sheet frame, which starts below it
const BOTTOM_SHEET_TAB_ROW_HEIGHT = 40

export const bottomSheetTabRowStyles = "items-center justify-end"

export const bottomSheetTabRowStyle = { height: BOTTOM_SHEET_TAB_ROW_HEIGHT }

export const bottomSheetTabbedBackgroundStyle = { top: BOTTOM_SHEET_TAB_ROW_HEIGHT }
