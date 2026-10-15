import { styles } from "frontend-shared/styles"

import type { SwitchSize } from "./switch.helper"

interface SwitchStylesOpts {
    checked: boolean
    size: SwitchSize
}
export const switchRootStyles = styles((opts: SwitchStylesOpts) => [
    "outline-primary-500 relative inline-flex shrink-0 cursor-pointer items-center rounded-full border px-0.5 outline-offset-1 transition-colors focus-visible:outline-1 disabled:cursor-not-allowed disabled:opacity-50",
    {
        "h-6 w-12": opts.size === "sm",
        "h-8 w-14": opts.size === "md",
        "border-neutral-400 bg-neutral-100 enabled:hover:bg-neutral-200 dark:border-neutral-500 dark:bg-neutral-800 dark:enabled:hover:bg-neutral-700":
            !opts.checked,
        "border-primary-600 bg-primary-600 enabled:hover:bg-primary-800 enabled:hover:border-primary-800 dark:border-primary-300 dark:bg-primary-300 dark:enabled:hover:bg-primary-200 dark:enabled:hover:border-primary-200":
            opts.checked,
    },
])

export const switchThumbStyles = styles((opts: SwitchStylesOpts) => [
    "pointer-events-none inline-block rounded-full border bg-white transition-transform dark:bg-neutral-100",
    {
        "size-4.5": opts.size === "sm",
        "size-6.5": opts.size === "md",
        "translate-x-0 border-neutral-400 dark:border-neutral-500": !opts.checked,
        "translate-x-6 border-white dark:border-neutral-100": opts.checked,
    },
])
