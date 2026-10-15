"use client"

import { cn } from "frontend-shared/styles"
import type { ReactNode } from "react"

interface SettingToggleRenderItemProps {
    children: ReactNode
    toggled: boolean
}

export const SettingToggleRenderItem = (props: SettingToggleRenderItemProps) => (
    <span
        className={cn(
            "tp-pixel-sm flex size-6.5 items-center justify-center rounded transition-colors [&>svg]:size-4",
            {
                "bg-surface-inverse text-fg-inverse": props.toggled,
                "text-fg-muted hover:bg-surface-muted": !props.toggled,
            },
        )}
    >
        {props.children}
    </span>
)
