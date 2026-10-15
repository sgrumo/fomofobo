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
        "tp-pixel-sm gap-1 px-3 py-1": opts.size === "sm",
        "tp-pixel-md gap-2 px-4 py-2": opts.size === "md",
        "bg-surface-inverse focus-visible:outline-focus text-fg-inverse -outline-offset-2 transition-colors focus-visible:outline-2":
            opts.variant === "primary" && !opts.destructive,
        "bg-danger focus-visible:outline-danger-surface text-fg-inverse -outline-offset-2 transition-colors focus-visible:outline-2":
            opts.variant === "primary" && opts.destructive,
        "focus-visible:outline-focus shadow-hard-sm text-fg border-line-muted bg-surface not-focus-visible:not-aria-disabled:hover:bg-surface-muted border -outline-offset-2 focus-visible:outline-2":
            opts.variant === "secondary",
        "focus-visible:outline-focus text-fg bg-surface -outline-offset-2 focus-visible:outline-2":
            opts.variant === "tertiary",
    },
])

export const buttonIconContainerStyles = styles(
    (opts: Pick<ButtonStylesOpts, "size">) => ({
        "[&>svg]:size-3": opts.size === "sm",
        "[&>svg]:size-4": opts.size === "md" || opts.size === "icon",
    }),
)
