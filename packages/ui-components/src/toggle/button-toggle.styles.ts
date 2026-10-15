import { styles } from "frontend-shared/styles"

export const buttonToggleStyles = styles(
    () =>
        "focus-visible:outline-primary-600 dark:focus-visible:outline-primary-300 flex cursor-default items-center justify-center rounded-md p-2 text-neutral-500 transition-colors outline-none select-none hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50 data-[pressed]:bg-neutral-200 data-[pressed]:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 dark:data-[pressed]:bg-neutral-700 dark:data-[pressed]:text-neutral-100 [&>svg]:size-5",
)

export const buttonToggleGroupStyles = styles(
    () =>
        "flex items-center gap-1 rounded-lg border border-neutral-200 p-1 dark:border-neutral-700",
)

export const buttonToggleGroupItemStyles = styles((opts: { toggled: boolean }) => [
    "flex cursor-default items-center justify-center rounded-md p-2 text-neutral-500 transition-colors select-none hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 [&>svg]:size-5",
    {
        "bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100":
            opts.toggled,
    },
])
