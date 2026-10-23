import { cva } from "class-variance-authority"

export const selectTriggerStyles =
    "min-h-11 flex-row items-center justify-between gap-2 rounded-md border-2 border-line bg-surface px-3"

export const selectValueStyles = "tp-body-lg flex-1 text-fg"

export const selectPlaceholderStyles = "tp-body-lg flex-1 text-fg-muted"

export const SELECT_CHEVRON_SIZE = 16

export const selectOptionVariants = cva(
    "min-h-11 flex-row items-center justify-between gap-3 rounded-md px-2",
    {
        variants: {
            selected: {
                true: "bg-surface-muted",
                false: "",
            },
        },
    },
)

export const selectOptionTextStyles = "tp-body-lg flex-1 text-fg"

export const SELECT_CHECK_SIZE = 16
