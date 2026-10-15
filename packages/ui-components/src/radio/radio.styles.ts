import { styles } from "frontend-shared/styles"

import type { RadioSize } from "./radio.helper"

interface RadioRootStylesOpts {
    checked: boolean
    size: RadioSize
}
export const radioRootStyles = styles((opts: RadioRootStylesOpts) => [
    "outline-focus border-line inline-flex items-center justify-center rounded-full border outline-offset-1 transition-colors focus-visible:outline-1 disabled:cursor-not-allowed disabled:opacity-50",
    {
        "size-4": opts.size === "sm",
        "size-5": opts.size === "md",
        "bg-surface": !opts.checked,
        "bg-surface-inverse": opts.checked,
    },
])

interface RadioIndicatorStylesOpts {
    size: RadioSize
}
export const radioIndicatorStyles = styles((opts: RadioIndicatorStylesOpts) => [
    "bg-surface rounded-full",
    {
        "size-1.5": opts.size === "sm",
        "size-2": opts.size === "md",
    },
])
