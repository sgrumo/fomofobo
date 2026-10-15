import { cn } from "frontend-shared/styles"

import { IconSpinner } from "../icons/icons"

export interface SpinnerProps {
    title?: string
    size?: "xs" | "sm" | "md" | "lg" | "custom"
    theme?: "default" | "custom"
    className?: string
}
export const Spinner = ({
    title,
    size = "sm",
    theme = "default",
    className,
}: SpinnerProps) => (
    <IconSpinner
        title={title}
        className={cn(
            "animate-spin",
            {
                "h-5 w-5": size === "xs",
                "h-8 w-8": size === "sm",
                "h-12 w-12": size === "md",
                "h-16 w-16": size === "lg",
                "text-fg/50": theme === "default",
            },
            className,
        )}
    />
)
