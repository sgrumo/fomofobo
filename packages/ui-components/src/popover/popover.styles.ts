import { styles } from "frontend-shared/styles"

import { typographyNotOverridden } from "../styling/styling.helper"
import type { TypographyOpts } from "../styling/styling.helper"

export const popoverPopupStyles = styles(
    () =>
        "shadow-hard-md bg-surface flex origin-(--transform-origin) flex-col gap-3 rounded-lg p-4 transition-[transform,scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
)

export const popoverArrowStyles = styles(
    () =>
        "[&>svg]:text-fg-inverse data-[side=bottom]:-top-2.5 data-[side=bottom]:rotate-0 data-[side=left]:-right-2.5 data-[side=left]:rotate-90 data-[side=right]:-left-2.5 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2.5 data-[side=top]:rotate-180 [&>svg]:size-4",
)

export const popoverTitleStyles = styles((opts: TypographyOpts) => [
    "text-fg",
    {
        "tp-pixel-md": typographyNotOverridden(opts),
    },
])

export const popoverHeaderStyles = styles(() => "flex items-center justify-between gap-2")

export const popoverCloseIconStyles = styles(
    () => "text-fg-subtle enabled:hover:text-fg-muted transition-colors [&>svg]:size-5",
)

export const popoverDescriptionStyles = styles((opts: TypographyOpts) => [
    "text-fg-muted",
    {
        "tp-body-md": typographyNotOverridden(opts),
    },
])
