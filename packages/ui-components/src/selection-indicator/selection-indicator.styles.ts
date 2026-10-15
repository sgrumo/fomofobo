import { styles } from "frontend-shared/styles"

interface SelectionIndicatorIconStylesOpts {
    size: "sm" | "md"
}
export const selectionIndicatorIconStyles = styles(
    (opts: SelectionIndicatorIconStylesOpts) => [
        "text-fg",
        {
            "size-4": opts.size === "sm",
            "size-5": opts.size === "md",
        },
    ],
)

export const selectionIndicatorIconContainerStyles = styles(
    () => "flex w-full items-center justify-center",
)
