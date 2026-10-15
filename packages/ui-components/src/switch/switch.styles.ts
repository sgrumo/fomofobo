import { styles } from "frontend-shared/styles"

import type { SwitchSize } from "./switch.helper"

interface SwitchStylesOpts {
    checked: boolean
    size: SwitchSize
}
export const switchRootStyles = styles((opts: SwitchStylesOpts) => [
    "outline-focus border-line shadow-hard-sm relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 px-0.5 outline-offset-2 transition-colors focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50",
    {
        "h-6 w-12": opts.size === "sm",
        "h-8 w-14": opts.size === "md",
        "bg-surface-muted enabled:hover:bg-line-muted": !opts.checked,
        "bg-live": opts.checked,
    },
])

export const switchThumbStyles = styles((opts: SwitchStylesOpts) => [
    "bg-surface border-line pointer-events-none inline-block rounded-full border-2 transition-transform",
    {
        "size-4": opts.size === "sm",
        "size-6": opts.size === "md",
        "translate-x-0": !opts.checked,
        "translate-x-6": opts.checked,
    },
])
