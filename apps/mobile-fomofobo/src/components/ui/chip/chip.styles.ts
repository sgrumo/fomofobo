import { cva } from "class-variance-authority"

export const chipRowStyles = "flex-row items-center gap-1.5 px-0.5 pb-1 pt-0.5"

export const chipRowWrapStyles = "flex-wrap gap-y-2"

export const chipBarStyles = "overflow-hidden rounded-md border-2 border-line bg-surface"

// Runs 2 pt past the outline, which clips the right divider of the last chip
export const chipBarTrackStyles = "-mr-0.5 flex-row"

export const chipVariants = cva("flex-row items-center gap-1.5 border-line px-2.5", {
    variants: {
        pressed: {
            true: "",
            false: "",
        },
        tone: {
            inverse: "",
            live: "",
            upcoming: "",
            ended: "",
            permanent: "",
        },
        inBar: {
            true: "h-6 border-r-2",
            false: "h-7 rounded-md border-2",
        },
    },
    compoundVariants: [
        { pressed: false, tone: "inverse", className: "bg-surface" },
        // A colored chip keeps its fill, see-through until pressed
        { pressed: false, tone: "live", className: "bg-live/40" },
        { pressed: false, tone: "upcoming", className: "bg-upcoming/40" },
        { pressed: false, tone: "ended", className: "bg-ended/40" },
        { pressed: false, tone: "permanent", className: "bg-permanent/40" },
        { pressed: true, tone: "inverse", className: "bg-surface-inverse" },
        { pressed: true, tone: "live", className: "bg-live" },
        { pressed: true, tone: "upcoming", className: "bg-upcoming" },
        { pressed: true, tone: "ended", className: "bg-ended" },
        { pressed: true, tone: "permanent", className: "bg-permanent" },
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

// Brings the 28 pt chip to the 44 pt target
export const CHIP_HIT_SLOP = 8
