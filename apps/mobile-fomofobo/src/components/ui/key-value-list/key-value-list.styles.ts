import { cva } from "class-variance-authority"

export const keyValueListStyles = "border-line border-2"

export const keyValueRowVariants = cva(
    "flex-row items-baseline justify-between gap-3 px-3 py-2",
    {
        variants: {
            first: {
                true: "",
                false: "border-t-2 border-line-muted",
            },
        },
    },
)

export const keyValueLabelStyles = "tp-body-md text-fg shrink"

export const keyValueValueStyles = "tp-pixel-md text-fg shrink text-right"
