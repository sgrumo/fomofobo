import { styles } from "frontend-shared/styles"

import type { IconButtonSize, IconButtonTone } from "./icon-button.helper"

interface IconButtonStylesOpts {
    tone: IconButtonTone
    size: IconButtonSize
}
export const iconButtonStyles = styles((opts: IconButtonStylesOpts) => [
    "border-line shadow-hard-md focus-visible:outline-focus enabled:active:shadow-hard-sm inline-flex shrink-0 items-center justify-center rounded-full border-2 transition-[translate,box-shadow,background] focus-visible:outline-2 focus-visible:outline-offset-2 enabled:active:translate-x-0.5 enabled:active:translate-y-0.5 disabled:opacity-50",
    {
        "size-8 [&>svg]:size-3.5": opts.size === "sm",
        "size-10 [&>svg]:size-4": opts.size === "md",
        "size-12 [&>svg]:size-5": opts.size === "lg",
        "bg-surface text-fg enabled:hover:bg-surface-muted": opts.tone === "surface",
        "bg-live text-fg": opts.tone === "live",
        "bg-surface-inverse text-fg-inverse": opts.tone === "inverse",
    },
])
