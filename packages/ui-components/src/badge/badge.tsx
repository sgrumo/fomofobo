import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"

import type { BadgeTone } from "./badge.helper"
import { badgeDotStyles, badgeStyles } from "./badge.styles"

interface BadgeProps extends ComponentProps<"span"> {
    tone?: BadgeTone
    dot?: boolean
}
export const Badge = ({
    tone = "neutral",
    dot = false,
    className,
    children,
    ...props
}: BadgeProps) => (
    <span className={cn(badgeStyles(tone), className)} {...props}>
        {dot && <span aria-hidden={true} className={badgeDotStyles(tone)} />}
        {children}
    </span>
)
