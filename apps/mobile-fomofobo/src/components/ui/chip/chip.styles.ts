import { cva } from "class-variance-authority"

export const chipRowStyles = "flex-row items-center gap-1.5 px-0.5 pb-1 pt-0.5"

export const chipRowWrapStyles = "flex-wrap justify-center gap-y-2"

export const chipBarStyles = "overflow-hidden rounded-md border-2 border-line bg-surface"

// Runs 2 pt past the outline, which clips the right divider of the last chip
export const chipBarTrackStyles = "-mr-0.5 flex-row"

export const chipVariants = cva("flex-row items-center gap-1.5", {
    variants: {
        pressed: {
            true: "",
            false: "",
        },
        inverseTone: {
            true: "",
            false: "",
        },
        // A colored chip draws stepped corners, as the search field
        shape: {
            bar: "h-6 border-r-2 border-line px-2.5",
            rounded: "h-7 rounded-md border-2 border-line px-2.5",
            pixel: "h-7 px-3",
        },
    },
    compoundVariants: [
        { pressed: false, inverseTone: true, className: "bg-surface" },
        { pressed: true, inverseTone: true, className: "bg-surface-inverse" },
    ],
})

export const chipLabelVariants = cva("tp-pixel-sm", {
    variants: {
        inverse: {
            true: "text-fg-inverse",
            false: "text-fg",
        },
    },
})

export const chipCountVariants = cva("tp-pixel-sm", {
    variants: {
        pressed: {
            true: "",
            false: "text-fg-muted",
        },
        inverseTone: {
            true: "",
            false: "",
        },
    },
    compoundVariants: [
        { pressed: true, inverseTone: true, className: "text-line-muted" },
        { pressed: true, inverseTone: false, className: "text-fg" },
    ],
})

export const CHIP_ICON_SIZE = 12

export const CHIP_BOUNCE = { scale: 0.95, shift: false }

// Brings the 28 pt chip to the 44 pt target
export const CHIP_HIT_SLOP = 8
