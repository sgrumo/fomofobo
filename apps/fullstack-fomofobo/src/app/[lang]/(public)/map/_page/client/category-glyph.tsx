"use client"

import { MARKER_CELL_PX, PIN_ICONS } from "domain/pixel-markers"
import type { CategoryIcon } from "models"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface CategoryGlyphProps extends RouteClientComponentProps<"map"> {
    icon: CategoryIcon
    className?: string
}

// The icon of the map pin at half its size, in whole px cells
export const CategoryGlyph = (props: CategoryGlyphProps) => {
    const pinIcon = PIN_ICONS[props.icon]
    const side = pinIcon.cells * Math.round(pinIcon.cellPx / MARKER_CELL_PX)

    return (
        <svg
            aria-hidden={true}
            width={side}
            height={side}
            viewBox={`0 0 ${String(pinIcon.cells)} ${String(pinIcon.cells)}`}
            shapeRendering="crispEdges"
            className={props.className}
        >
            <path d={pinIcon.path} />
        </svg>
    )
}
