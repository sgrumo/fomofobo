import { cn } from "frontend-shared/styles"
import { useId } from "react"
import type { ReactNode } from "react"

import {
    statGridCellStyles,
    statGridLabelStyles,
    statGridStyles,
    statGridValueStyles,
} from "./stat-grid.styles"

export interface StatGridItem {
    label: string
    value: ReactNode
}

interface StatGridProps {
    items: StatGridItem[]
    className?: string
}
export const StatGrid = (props: StatGridProps) => (
    <div className={cn(statGridStyles(), props.className)}>
        {props.items.map(item => (
            <StatGridCell key={item.label} item={item} />
        ))}
    </div>
)

const StatGridCell = (props: { item: StatGridItem }) => {
    const labelId = useId()

    return (
        <dl role="group" aria-labelledby={labelId} className={statGridCellStyles()}>
            <dt id={labelId} className={statGridLabelStyles()}>
                {props.item.label}
            </dt>
            <dd className={statGridValueStyles()}>{props.item.value}</dd>
        </dl>
    )
}
