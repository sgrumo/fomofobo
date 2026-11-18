import { BOTTOM_SHEET_INSET } from "@/components/ui/bottom-sheet/bottom-sheet.styles"

export const bottomSheetPanelContentStyles = "gap-3 px-4 pb-4"

export const bottomSheetPanelStyle = { marginHorizontal: BOTTOM_SHEET_INSET }

// Holds the tab above the top of the sheet frame
export const BOTTOM_SHEET_TAB_ROW_HEIGHT = 44

export const bottomSheetTabLayerStyle = {
    position: "absolute",
    top: 0,
    left: BOTTOM_SHEET_INSET,
    right: BOTTOM_SHEET_INSET,
} as const

// The row clips the bottom of the tab, which tucks under the top line of the frame as on the web
export const bottomSheetTabRowStyles = "items-center justify-end overflow-hidden"

export const bottomSheetTabRowStyle = { height: BOTTOM_SHEET_TAB_ROW_HEIGHT }

export const bottomSheetTabTuckStyle = { marginBottom: -8 }

// Upward travel in pt of a drag on the content that fires `onSwipeUp`, as on the web
export const SWIPE_UP_DISTANCE = 48

// A drag up of 12 pt starts the swipe of the content, a drag down of 12 pt fails it and starts
// the pan of the sheet
export const SWIPE_UP_ACTIVE_OFFSETS: [number, number] = [-12, Number.MAX_SAFE_INTEGER]
export const DRAG_DOWN_OFFSETS: [number, number] = [Number.MIN_SAFE_INTEGER, 12]
