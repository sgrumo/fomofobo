import { styles } from "frontend-shared/styles"

import type { IconButtonSize, IconButtonTone } from "./icon-button.helper"

interface IconButtonStylesOpts {
    tone: IconButtonTone
    size: IconButtonSize
}
export const iconButtonStyles = styles((opts: IconButtonStylesOpts) => [
    "drop-shadow-hard-md focus-visible:outline-focus enabled:active:drop-shadow-hard-sm relative inline-flex shrink-0 items-center justify-center rounded-full transition-[translate,filter] focus-visible:outline-2 focus-visible:outline-offset-2 enabled:active:translate-x-0.5 enabled:active:translate-y-0.5 disabled:opacity-50",
    {
        "pixel-circle-32 size-8 [&>svg]:size-3.5": opts.size === "sm",
        "pixel-circle-40 size-10 [&>svg]:size-4": opts.size === "md",
        "pixel-circle-48 size-12 [&>svg]:size-5": opts.size === "lg",
        "text-fg enabled:hover:[--pixel-fill:var(--color-surface-muted)]":
            opts.tone === "surface",
        "text-fg [--pixel-fill:var(--color-live)]": opts.tone === "live",
        "text-fg-inverse [--pixel-fill:var(--color-surface-inverse)]":
            opts.tone === "inverse",
    },
])
