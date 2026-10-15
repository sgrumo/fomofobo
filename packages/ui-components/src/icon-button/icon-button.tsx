import { Button as ButtonPrimitive } from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps, ReactNode } from "react"
import type { StrictOmit } from "shared/types"

import type { IconButtonSize, IconButtonTone } from "./icon-button.helper"
import { iconButtonStyles } from "./icon-button.styles"

interface IconButtonProps extends StrictOmit<
    ComponentProps<typeof ButtonPrimitive>,
    "children" | "aria-label" | "className"
> {
    "aria-label": string
    icon: ReactNode
    tone?: IconButtonTone
    size?: IconButtonSize
    className?: string
}
export const IconButton = ({
    icon,
    tone = "surface",
    size = "md",
    className,
    ...props
}: IconButtonProps) => (
    <ButtonPrimitive
        className={cn(iconButtonStyles({ tone, size }), className)}
        {...props}
    >
        {icon}
    </ButtonPrimitive>
)
