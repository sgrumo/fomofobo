import { Toggle as TogglePrimitive } from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps, ReactNode } from "react"
import type { StrictOmit } from "shared/types"
import { isDefined } from "shared/values"

import type { ChipTone } from "./chip.helper"
import {
    chipBarStyles,
    chipCountStyles,
    chipIconStyles,
    chipRowStyles,
    chipStyles,
} from "./chip.styles"

interface ChipRowProps {
    label: string
    children?: ReactNode
    className?: string
}
export const ChipRow = (props: ChipRowProps) => (
    <div
        role="group"
        aria-label={props.label}
        className={cn(chipRowStyles(), props.className)}
    >
        {props.children}
    </div>
)

interface ChipBarProps {
    label: string
    children?: ReactNode
}
export const ChipBar = (props: ChipBarProps) => (
    <div role="group" aria-label={props.label} className={chipBarStyles()}>
        {props.children}
    </div>
)

interface ChipProps extends StrictOmit<
    ComponentProps<typeof TogglePrimitive>,
    "children" | "className"
> {
    label: string
    icon?: ReactNode
    count?: number
    tone?: ChipTone
    className?: string
}
export const Chip = ({
    label,
    icon,
    count,
    tone = "inverse",
    className,
    ...props
}: ChipProps) => (
    <TogglePrimitive className={cn(chipStyles(tone), className)} {...props}>
        {isDefined(icon) && <span className={chipIconStyles()}>{icon}</span>}
        <span>{label}</span>
        {isDefined(count) && (
            <>
                {" "}
                <span className={chipCountStyles(tone)}>{count}</span>
            </>
        )}
    </TogglePrimitive>
)
