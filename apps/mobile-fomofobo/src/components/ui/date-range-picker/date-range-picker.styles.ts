import { cva } from "class-variance-authority"

export const dateRangePickerStyles = "gap-1"

export const dateRangeHeaderStyles = "flex-row items-center justify-between gap-2"

export const dateRangeMonthStyles = "tp-pixel-md flex-1 text-center text-fg"

export const dateRangeWeekStyles = "flex-row"

export const dateRangeWeekdayStyles = "tp-pixel-sm flex-1 text-center text-fg-muted"

// Square cells, as the 8-bit controls of the app
export const dateRangeDayVariants = cva("h-9 flex-1 items-center justify-center", {
    variants: {
        state: {
            endpoint: "bg-surface-inverse",
            inside: "bg-surface-muted",
            today: "border-2 border-line",
            plain: "",
        },
    },
})

// Brings a 36 pt day to the 44 pt target, so the grid fits under the filters of the map
export const DATE_RANGE_DAY_HIT_SLOP = { top: 4, bottom: 4 }

export const dateRangeDayTextVariants = cva("tp-pixel-md", {
    variants: {
        state: {
            endpoint: "text-fg-inverse",
            inside: "text-fg",
            today: "text-fg",
            plain: "text-fg",
        },
        disabled: {
            true: "text-fg-subtle",
            false: "",
        },
    },
})

export const dateRangeEmptyStyles = "h-9 flex-1"
