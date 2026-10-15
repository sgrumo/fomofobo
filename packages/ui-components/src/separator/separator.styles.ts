import { styles } from "frontend-shared/styles"

interface SeparatorStylesOpts {
    orientation: "horizontal" | "vertical"
}
export const separatorStyles = styles((opts: SeparatorStylesOpts) => [
    "bg-line shrink-0",
    {
        "h-0.5 w-full": opts.orientation === "horizontal",
        "h-full w-0.5": opts.orientation === "vertical",
    },
])
