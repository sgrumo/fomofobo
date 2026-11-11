import { styles } from "frontend-shared/styles"

export const bottomSheetPopupStyles = styles(
    () =>
        "pixel-corners drop-shadow-hard-lg fixed inset-x-2 bottom-2 flex max-h-[85dvh] flex-col gap-3 pt-2 pb-4 transition-transform duration-200 ease-out outline-none data-[ending-style]:translate-y-[calc(100%+0.5rem)] data-[starting-style]:translate-y-[calc(100%+0.5rem)]",
)

export const bottomSheetHandleStyles = styles(
    () => "bg-line-muted mx-auto h-1 w-10 shrink-0",
)

// The side padding sits on the scroller, so a child that bleeds to the edges with `-mx-4` fits it
export const bottomSheetContentStyles = styles(
    () => "-mb-1 flex min-h-0 flex-col gap-3 overflow-x-hidden overflow-y-auto px-4 pb-1",
)

// Peeks above the top edge, and its lower part sits behind the sheet frame
export const bottomSheetTabStyles = styles(
    () => "absolute bottom-[calc(100%-0.5rem)] left-1/2 -z-10 -translate-x-1/2",
)
