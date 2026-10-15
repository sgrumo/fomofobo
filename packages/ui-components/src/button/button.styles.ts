import { styles } from "frontend-shared/styles"

interface ButtonStylesOpts {
    variant: "primary" | "accent" | "secondary" | "tertiary"
    size: "sm" | "md" | "icon"
    destructive: boolean
}

export const buttonStyles = styles((opts: ButtonStylesOpts) => [
    "focus-visible:outline-focus inline-flex items-center justify-center transition-[background,translate,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:opacity-50",
    {
        "rounded-md": opts.size !== "icon",
        "gap-0 rounded-full p-2": opts.size === "icon",
        "tp-pixel-sm gap-1 px-3 py-1": opts.size === "sm",
        "tp-pixel-md gap-2 px-4 py-2.5": opts.size === "md",
        "border-line shadow-hard-md not-aria-disabled:active:shadow-hard-sm border-2 not-aria-disabled:active:translate-x-0.5 not-aria-disabled:active:translate-y-0.5":
            opts.variant !== "tertiary",
        "bg-surface-inverse text-fg-inverse shadow-live":
            opts.variant === "primary" && !opts.destructive,
        "bg-danger text-fg-inverse": opts.variant === "primary" && opts.destructive,
        "bg-social text-fg": opts.variant === "accent",
        "bg-surface text-fg not-aria-disabled:hover:bg-surface-muted":
            opts.variant === "secondary",
        "text-fg not-aria-disabled:hover:bg-surface-muted bg-transparent":
            opts.variant === "tertiary",
    },
])

export const buttonIconContainerStyles = styles(
    (opts: Pick<ButtonStylesOpts, "size">) => ({
        "[&>svg]:size-3": opts.size === "sm",
        "[&>svg]:size-4": opts.size === "md" || opts.size === "icon",
    }),
)
