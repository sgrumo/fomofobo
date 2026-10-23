import { cva } from "class-variance-authority"
import type { CSSAnimationProperties } from "react-native-reanimated"

export const badgeVariants = cva(
    "flex-row items-center gap-1.5 self-start rounded-sm border-2 border-line px-1.5 py-0.5",
    {
        variants: {
            tone: {
                live: "bg-live",
                upcoming: "bg-upcoming",
                ended: "bg-ended",
                permanent: "bg-permanent",
                neutral: "bg-surface",
                inverse: "bg-surface-inverse",
            },
        },
        defaultVariants: { tone: "neutral" },
    },
)

export const badgeTextVariants = cva("tp-pixel-sm", {
    variants: {
        tone: {
            live: "text-fg",
            upcoming: "text-fg",
            ended: "text-fg",
            permanent: "text-fg",
            neutral: "text-fg",
            inverse: "text-fg-inverse",
        },
    },
    defaultVariants: { tone: "neutral" },
})

export const badgeDotVariants = cva("h-1.5 w-1.5", {
    variants: {
        tone: {
            live: "bg-fg",
            upcoming: "bg-fg",
            ended: "bg-fg",
            permanent: "bg-fg",
            neutral: "bg-live",
            inverse: "bg-fg-inverse",
        },
    },
    defaultVariants: { tone: "neutral" },
})

export const livePulse: CSSAnimationProperties = {
    animationName: { "50%": { opacity: 0.1, transform: [{ scale: 0.6 }] } },
    animationDuration: "1s",
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-in-out",
}
