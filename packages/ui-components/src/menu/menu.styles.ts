import { styles } from "frontend-shared/styles"

export const menuPositionerStyles = styles(() => "select-none")

export const menuPopupStyles = styles(
    () =>
        "shadow-300 z-50 flex max-h-[var(--available-height)] min-w-[8rem] origin-[var(--transform-origin)] flex-col overflow-x-hidden overflow-y-auto rounded-lg bg-white p-1 outline-1 outline-neutral-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:bg-neutral-900 dark:shadow-none dark:outline-neutral-700",
)

interface MenuItemStylesOpts {
    variant: "default" | "destructive"
}
export const menuItemStyles = styles((opts: MenuItemStylesOpts) => [
    "tp-b2-regular flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-neutral-600 outline-none select-none data-[highlighted]:bg-neutral-100 data-[highlighted]:text-neutral-800 dark:text-neutral-300 dark:data-[highlighted]:bg-neutral-800 dark:data-[highlighted]:text-neutral-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-neutral-400 dark:[&_svg:not([class*='text-'])]:text-neutral-500",
    {
        "text-danger-600 dark:text-danger-400 data-[highlighted]:bg-danger-100 dark:data-[highlighted]:bg-danger-800/30 data-[highlighted]:text-danger-600 dark:data-[highlighted]:text-danger-400 [&_svg:not([class*='text-'])]:text-danger-600 dark:[&_svg:not([class*='text-'])]:text-danger-400":
            opts.variant === "destructive",
    },
])

export const menuGroupLabelStyles = styles(
    () => "tp-b2-medium px-2 py-1.5 text-neutral-800 dark:text-neutral-100",
)

export const menuSeparatorStyles = styles(
    () => "my-1 h-px bg-neutral-200 dark:bg-neutral-700",
)
