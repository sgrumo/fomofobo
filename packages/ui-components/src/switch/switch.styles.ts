import { styles } from "frontend-shared/styles"

import type { SwitchSize } from "./switch.helper"

interface SwitchStylesOpts {
    checked: boolean
    size: SwitchSize
}
export const switchRootStyles = styles((opts: SwitchStylesOpts) => [
    "outline-focus border-line relative inline-flex shrink-0 cursor-pointer items-center rounded-full border px-0.5 outline-offset-1 transition-colors focus-visible:outline-1 disabled:cursor-not-allowed disabled:opacity-50",
    {
        "h-6 w-12": opts.size === "sm",
        "h-8 w-14": opts.size === "md",
        "bg-surface-muted enabled:hover:bg-line-muted": !opts.checked,
        "bg-surface-inverse": opts.checked,
    },
])

export const switchThumbStyles = styles((opts: SwitchStylesOpts) => [
    "bg-surface pointer-events-none inline-block rounded-full border transition-transform",
    {
        "size-4.5": opts.size === "sm",
        "size-6.5": opts.size === "md",
        "border-line translate-x-0": !opts.checked,
        "border-surface translate-x-6": opts.checked,
    },
])
