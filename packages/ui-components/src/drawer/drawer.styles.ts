import { styles } from "frontend-shared/styles"

import { typographyNotOverridden } from "../styling/styling.helper"
import type { TypographyOpts } from "../styling/styling.helper"
import type { DrawerContext } from "./drawer.helper"

export const drawerBackdropStyles = styles(
    () =>
        "bg-backdrop fixed inset-0 min-h-dvh opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
)

export const drawerPopupStyles = styles((opts: Pick<DrawerContext, "side">) => [
    "shadow-hard-lg bg-surface fixed flex flex-col gap-4 rounded-t-xl p-6 transition-transform duration-200 ease-out",
    {
        "inset-x-0 bottom-0 grid max-h-[85dvh] grid-cols-1 grid-rows-[auto_1fr] gap-2 data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full":
            opts.side === "bottom",
        "inset-y-0 right-0 grid w-[min(24rem,90dvw)] grid-cols-[auto_1fr] grid-rows-1 rounded-t-none rounded-l-xl data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full":
            opts.side === "right",
        "inset-x-0 top-0 grid max-h-[85dvh] grid-cols-1 grid-rows-[1fr_auto] gap-2 rounded-t-none rounded-b-xl data-[ending-style]:-translate-y-full data-[starting-style]:-translate-y-full":
            opts.side === "top",
        "inset-y-0 left-0 grid w-[min(24rem,90dvw)] grid-cols-[1fr_auto] grid-rows-1 rounded-t-none rounded-r-xl data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full":
            opts.side === "left",
    },
])

export const drawerHandleStyles = styles((opts: Pick<DrawerContext, "side">) => [
    "bg-line-muted shrink-0 rounded-full",
    {
        "mx-auto h-1 w-10": opts.side === "top" || opts.side === "bottom",
        "my-auto h-10 w-1": opts.side === "right" || opts.side === "left",
        "order-1": opts.side === "top" || opts.side === "left",
        "-order-1": opts.side === "bottom" || opts.side === "right",
    },
])

export const drawerContentStyles = styles((opts: Pick<DrawerContext, "side">) => ({
    "order-1": opts.side === "bottom" || opts.side === "right",
    "-order-1": opts.side === "top" || opts.side === "left",
}))

export const drawerTitleStyles = styles((opts: TypographyOpts) => [
    "text-fg",
    {
        "tp-pixel-lg": typographyNotOverridden(opts),
    },
])

export const drawerHeaderStyles = styles(() => "flex items-start justify-between gap-2")

export const drawerHeaderContentStyles = styles(() => "flex flex-col gap-1")

export const drawerCloseIconStyles = styles(
    () => "text-fg-subtle enabled:hover:text-fg-muted transition-colors [&>svg]:size-6",
)

export const drawerBodyStyles = styles(() => "min-h-0 grow overflow-auto")

export const drawerDescriptionStyles = styles((opts: TypographyOpts) => [
    "text-fg-muted",
    {
        "tp-body-md": typographyNotOverridden(opts),
    },
])
