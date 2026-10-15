import { styles } from "frontend-shared/styles"

import { typographyNotOverridden } from "../styling/styling.helper"
import type { TypographyOpts } from "../styling/styling.helper"

export const popoverPopupStyles = styles(
    () =>
        "shadow-300 flex origin-(--transform-origin) flex-col gap-3 rounded-lg bg-white p-4 transition-[transform,scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:bg-neutral-900 dark:shadow-none",
)

export const popoverArrowStyles = styles(
    () =>
        "data-[side=bottom]:-top-2.5 data-[side=bottom]:rotate-0 data-[side=left]:-right-2.5 data-[side=left]:rotate-90 data-[side=right]:-left-2.5 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2.5 data-[side=top]:rotate-180 [&>svg]:size-4 [&>svg]:text-white dark:[&>svg]:text-neutral-800",
)

export const popoverTitleStyles = styles((opts: TypographyOpts) => [
    "text-neutral-800 dark:text-neutral-100",
    {
        "tp-b1-semibold": typographyNotOverridden(opts),
    },
])

export const popoverHeaderStyles = styles(() => "flex items-center justify-between gap-2")

export const popoverCloseIconStyles = styles(
    () =>
        "text-neutral-400 transition-colors enabled:hover:text-neutral-500 dark:text-neutral-500 dark:enabled:hover:text-neutral-400 [&>svg]:size-5",
)

export const popoverDescriptionStyles = styles((opts: TypographyOpts) => [
    "text-neutral-500 dark:text-neutral-400",
    {
        "tp-b2-regular": typographyNotOverridden(opts),
    },
])
