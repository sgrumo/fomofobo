import { BOTTOM_SHEET_INSET } from "@/components/ui/bottom-sheet/bottom-sheet.styles"

export const DETAIL_SHEET_SNAP_POINTS = ["100%"]

// Stops the sheet under the search row of the map, over its filter chips: 8 pt, the 44 pt row, 8 pt
export const DETAIL_SHEET_TOP_GAP = 60

export const detailSheetStyle = { marginHorizontal: BOTTOM_SHEET_INSET }

export const detailSheetContentStyle = {
    gap: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
}

export const detailSheetFooterStyles =
    "flex-row gap-3 border-t-2 border-line bg-surface px-4 py-3"
