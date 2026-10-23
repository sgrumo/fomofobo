import { cva } from "class-variance-authority"

export const dateRangePickerStyles = "gap-2"

export const dateRangeHeaderStyles = "flex-row items-center justify-between gap-2"

export const dateRangeMonthStyles = "tp-pixel-md flex-1 text-center text-fg"

export const dateRangeWeekStyles = "flex-row"

export const dateRangeWeekdayStyles = "tp-pixel-sm flex-1 text-center text-fg-muted"

export const dateRangeDayVariants = cva(
    "h-11 flex-1 items-center justify-center rounded-md",
    {
        variants: {
            state: {
                endpoint: "bg-surface-inverse",
                inside: "bg-surface-muted",
                today: "border-2 border-line",
                plain: "",
            },
        },
    },
)

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

export const dateRangeEmptyStyles = "h-11 flex-1"
