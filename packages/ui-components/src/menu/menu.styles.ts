import { styles } from "frontend-shared/styles"

export const menuPositionerStyles = styles(() => "select-none")

export const menuPopupStyles = styles(
    () =>
        "shadow-hard-md bg-surface outline-line-muted z-50 flex max-h-[var(--available-height)] min-w-[8rem] origin-[var(--transform-origin)] flex-col overflow-x-hidden overflow-y-auto rounded-lg p-1 outline-1 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0",
)

interface MenuItemStylesOpts {
    variant: "default" | "destructive"
}
export const menuItemStyles = styles((opts: MenuItemStylesOpts) => [
    "tp-body-md text-fg-muted data-[highlighted]:bg-surface-muted data-[highlighted]:text-fg [&_svg:not([class*='text-'])]:text-fg-subtle flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 outline-none select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        "text-danger data-[highlighted]:bg-danger-surface data-[highlighted]:text-danger [&_svg:not([class*='text-'])]:text-danger":
            opts.variant === "destructive",
    },
])

export const menuGroupLabelStyles = styles(() => "tp-pixel-md text-fg px-2 py-1.5")

export const menuSeparatorStyles = styles(() => "bg-line-muted my-1 h-px")
