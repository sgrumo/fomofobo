import { cva } from "class-variance-authority"

import type { ThemeColor } from "@/lib/theme/theme-tokens"

export const noticeVariants = cva(
    "flex-row items-center gap-4 rounded-lg border-2 border-line p-4",
    {
        variants: {
            tone: {
                loading: "bg-surface-muted",
                info: "bg-info-surface",
                success: "bg-success-surface",
                warning: "bg-warning-surface",
                error: "bg-danger-surface",
            },
        },
        defaultVariants: { tone: "info" },
    },
)

export const noticeIconColors = {
    loading: "fg-muted",
    info: "info",
    success: "success",
    warning: "warning",
    error: "danger",
} as const satisfies Record<string, ThemeColor>

export const NOTICE_ICON_SIZE = 24

export const noticeTextListStyles = "flex-1 gap-1"

// Ink on every surface: `danger` on `danger-surface` stays under AA for body text
export const noticeLineStyles = "tp-body-md text-fg"
