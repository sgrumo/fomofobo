import { styles } from "frontend-shared/styles"

import { typographyNotOverridden } from "../styling/styling.helper"
import type { TypographyOpts } from "../styling/styling.helper"

export const dialogBackdropStyles = styles(
    () =>
        "bg-backdrop fixed inset-0 min-h-dvh opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute",
)

export const dialogPopupStyles = styles(
    () =>
        "after:bg-overlay bg-surface fixed top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg p-6 transition-all duration-150 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0 after:transition-opacity after:duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[nested-dialog-open]:after:opacity-100 data-[starting-style]:scale-90 data-[starting-style]:opacity-0",
)

export const dialogTitleStyles = styles((opts: TypographyOpts) => [
    "text-fg",
    {
        "tp-pixel-lg": typographyNotOverridden(opts),
    },
])

export const dialogHeaderStyles = styles(() => "flex items-center justify-between gap-2")

export const dialogCloseIconStyles = styles(
    () => "text-fg-subtle enabled:hover:text-fg-muted transition-colors [&>svg]:size-6",
)

export const dialogBodyStyles = styles(() => "min-h-0 grow overflow-auto")

export const dialogDescriptionStyles = styles((opts: TypographyOpts) => [
    "text-fg",
    {
        "tp-body-md": typographyNotOverridden(opts),
    },
])
