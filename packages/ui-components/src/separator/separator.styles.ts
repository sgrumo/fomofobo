import { styles } from "frontend-shared/styles"

interface SeparatorStylesOpts {
    orientation: "horizontal" | "vertical"
}
export const separatorStyles = styles((opts: SeparatorStylesOpts) => [
    "bg-line-muted shrink-0",
    {
        "h-px w-full": opts.orientation === "horizontal",
        "h-full w-px": opts.orientation === "vertical",
    },
])
