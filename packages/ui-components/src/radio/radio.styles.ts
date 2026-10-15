import { styles } from "frontend-shared/styles"

import type { RadioSize } from "./radio.helper"

interface RadioRootStylesOpts {
    checked: boolean
    size: RadioSize
}
export const radioRootStyles = styles((opts: RadioRootStylesOpts) => [
    "outline-primary-500 inline-flex items-center justify-center rounded-full border outline-offset-1 transition-colors focus-visible:outline-1 disabled:cursor-not-allowed disabled:opacity-50",
    {
        "size-4": opts.size === "sm",
        "size-5": opts.size === "md",
        "enabled:hover:border-primary-600 dark:enabled:hover:border-primary-300 border-neutral-500 bg-white dark:bg-neutral-900":
            !opts.checked,
        "border-primary-600 bg-primary-600 enabled:hover:bg-primary-800 dark:border-primary-300 dark:bg-primary-300 dark:enabled:hover:bg-primary-400":
            opts.checked,
    },
])

interface RadioIndicatorStylesOpts {
    size: RadioSize
}
export const radioIndicatorStyles = styles((opts: RadioIndicatorStylesOpts) => [
    "rounded-full bg-white",
    {
        "size-1.5": opts.size === "sm",
        "size-2": opts.size === "md",
    },
])
