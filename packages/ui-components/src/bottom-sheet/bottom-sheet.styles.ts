import { styles } from "frontend-shared/styles"

export const bottomSheetPopupStyles = styles(
    () =>
        "bg-surface border-line shadow-hard-lg fixed inset-x-2 bottom-2 flex max-h-[85dvh] flex-col gap-3 rounded-xl border-2 px-4 pt-2 pb-4 transition-transform duration-200 ease-out outline-none data-[ending-style]:translate-y-[calc(100%+0.5rem)] data-[starting-style]:translate-y-[calc(100%+0.5rem)]",
)

export const bottomSheetHandleStyles = styles(
    () => "bg-line-muted mx-auto h-1 w-10 shrink-0",
)

export const bottomSheetContentStyles = styles(
    () => "flex min-h-0 flex-col gap-3 overflow-auto",
)
