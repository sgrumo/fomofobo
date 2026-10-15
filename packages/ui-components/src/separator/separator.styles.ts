import { styles } from "frontend-shared/styles"

interface SeparatorStylesOpts {
    orientation: "horizontal" | "vertical"
}
export const separatorStyles = styles((opts: SeparatorStylesOpts) => [
    "shrink-0 bg-neutral-200 dark:bg-neutral-700",
    {
        "h-px w-full": opts.orientation === "horizontal",
        "h-full w-px": opts.orientation === "vertical",
    },
])
