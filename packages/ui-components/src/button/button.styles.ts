import { styles } from "frontend-shared/styles"

interface ButtonStylesOpts {
    variant: "primary" | "secondary" | "tertiary"
    size: "sm" | "md" | "icon"
    destructive: boolean
}

export const buttonStyles = styles((opts: ButtonStylesOpts) => [
    "inline-flex items-center justify-center transition-[background] aria-disabled:opacity-50",
    {
        "rounded-3xl": opts.size !== "icon",
        "gap-0 rounded-full p-2": opts.size === "icon",
        "tp-c1-medium gap-1 px-3 py-1": opts.size === "sm",
        "tp-b2-medium gap-2 px-4 py-2": opts.size === "md",
        "bg-primary-600 focus-visible:outline-primary-200 not-focus-visible:not-aria-disabled:hover:bg-primary-800 dark:bg-primary-300 dark:not-focus-visible:not-aria-disabled:hover:bg-primary-200 text-white -outline-offset-2 transition-colors focus-visible:outline-2 dark:text-black":
            opts.variant === "primary" && !opts.destructive,
        "bg-danger-600 not-focus-visible:not-aria-disabled:hover:bg-danger-800 focus-visible:outline-danger-200 dark:bg-danger-500 dark:not-focus-visible:not-aria-disabled:hover:bg-danger-400 text-white -outline-offset-2 transition-colors focus-visible:outline-2 dark:text-black":
            opts.variant === "primary" && opts.destructive,
        "focus-visible:outline-primary-200 shadow-100 text-primary-600 dark:text-primary-300 border border-neutral-200 bg-white -outline-offset-2 not-focus-visible:not-aria-disabled:hover:bg-neutral-100 focus-visible:outline-2 dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-none dark:not-focus-visible:not-aria-disabled:hover:bg-neutral-800":
            opts.variant === "secondary",
        "focus-visible:outline-primary-200 text-primary-600 not-focus-visible:not-aria-disabled:hover:text-primary-800 dark:text-primary-300 dark:not-focus-visible:not-aria-disabled:hover:text-primary-200 bg-white -outline-offset-2 focus-visible:outline-2 dark:bg-transparent":
            opts.variant === "tertiary",
    },
])

export const buttonIconContainerStyles = styles(
    (opts: Pick<ButtonStylesOpts, "size">) => ({
        "[&>svg]:size-3": opts.size === "sm",
        "[&>svg]:size-4": opts.size === "md" || opts.size === "icon",
    }),
)
