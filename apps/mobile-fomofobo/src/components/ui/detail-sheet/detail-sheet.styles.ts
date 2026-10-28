import { BOTTOM_SHEET_INSET } from "@/components/ui/bottom-sheet/bottom-sheet.styles"

// Leaves the top of the map in view, as the mockup of the event sheet
export const DETAIL_SHEET_SNAP_POINTS = ["88%"]

export const detailSheetStyle = { marginHorizontal: BOTTOM_SHEET_INSET }

export const detailSheetContentStyle = {
    gap: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
}

// Keeps the end of the content clear of the footer
export const detailSheetContentWithFooterStyle = {
    ...detailSheetContentStyle,
    paddingBottom: 96,
}

export const detailSheetFooterStyles =
    "flex-row gap-3 border-t-2 border-line bg-surface px-4 py-3"
