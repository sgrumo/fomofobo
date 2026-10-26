import { cva } from "class-variance-authority"

export const chipRowStyles = "flex-row items-center gap-1.5 px-0.5 pb-1 pt-0.5"

export const chipRowWrapStyles = "flex-wrap gap-y-2"

export const chipBarStyles = "overflow-hidden rounded-md border-2 border-line bg-surface"

// Runs 2 pt past the outline, which clips the right divider of the last chip
export const chipBarTrackStyles = "-mr-0.5 flex-row"

export const chipVariants = cva("flex-row items-center gap-1.5 border-line px-2.5", {
    variants: {
        pressed: {
            true: "bg-surface-inverse",
            false: "bg-surface",
        },
        inBar: {
            true: "h-6 border-r-2",
            false: "h-7 rounded-md border-2",
        },
    },
})

export const chipLabelVariants = cva("tp-pixel-sm", {
    variants: {
        pressed: {
            true: "text-fg-inverse",
            false: "text-fg",
        },
    },
})

export const chipCountVariants = cva("tp-pixel-sm", {
    variants: {
        pressed: {
            true: "text-line-muted",
            false: "text-fg-muted",
        },
    },
})

export const CHIP_ICON_SIZE = 12

// Brings the 28 pt chip to the 44 pt target
export const CHIP_HIT_SLOP = 8
