import { styles } from "frontend-shared/styles"

export const statGridStyles = styles(
    () => "border-line grid grid-cols-2 overflow-hidden rounded-lg border-2",
)

export const statGridCellStyles = styles(
    () =>
        "border-line flex flex-col gap-1 p-3 odd:border-r-2 last:odd:col-span-2 last:odd:border-r-0 nth-[n+3]:border-t-2",
)

export const statGridLabelStyles = styles(() => "tp-pixel-sm text-fg-muted")

export const statGridValueStyles = styles(() => "tp-pixel-lg text-fg")
