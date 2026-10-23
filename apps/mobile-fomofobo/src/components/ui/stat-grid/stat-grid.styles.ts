import { cva } from "class-variance-authority"

export const statGridStyles =
    "border-line flex-row flex-wrap overflow-hidden rounded-lg border-2"

export const statGridCellVariants = cva("gap-1 border-line p-3", {
    variants: {
        column: {
            left: "w-1/2 border-r-2",
            right: "w-1/2",
            full: "w-full",
        },
        firstRow: {
            true: "",
            false: "border-t-2",
        },
    },
})

export const statGridLabelStyles = "tp-pixel-sm text-fg-muted"

export const statGridValueStyles = "tp-pixel-lg text-fg"
