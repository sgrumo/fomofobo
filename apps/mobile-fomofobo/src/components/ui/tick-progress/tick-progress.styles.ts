import type { ThemeColor } from "@/lib/theme/theme-tokens"

export const tickProgressStyles = "h-3.5 w-full"

export const TICK_PROGRESS_HEIGHT = 14

export const TICK_PITCH = 4

export const TICK_WIDTH = 2

export const tickProgressTrackColor: ThemeColor = "line-muted"

export const tickProgressFillColors = {
    ink: "fg",
    live: "live",
} as const satisfies Record<string, ThemeColor>
