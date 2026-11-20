"use client"

import type { MapPointKind } from "domain/event-clusters"
import {
    EVENT_DISC,
    MARKER_CELL_PX,
    PIN_ICON_BOXES,
    PIN_ICONS,
    SELECTED_EVENT_DISC,
} from "domain/pixel-markers"
import { cn } from "frontend-shared/styles"
import type { CategoryIcon } from "models"
import type { ReactNode } from "react"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

// Shadow cells of a selected disc, right and down
const SHADOW_CELLS = 2

// Half the growth of a selected disc. The kit icons sit in `EVENT_DISC`, so a selected disc moves
// them by it, and hangs it below the pin so that its center stays on the point of the pin.
const SELECTED_HALF_GROWTH =
    ((SELECTED_EVENT_DISC.cells - EVENT_DISC.cells) * MARKER_CELL_PX) / 2

interface PixelDiscProps extends RouteClientComponentProps<"map"> {
    kind: MapPointKind
    icon: CategoryIcon
    selected: boolean
    // Drawn behind the disc, centered on it
    behind?: ReactNode
}

export const PixelDisc = (props: PixelDiscProps) => {
    const disc = props.selected ? SELECTED_EVENT_DISC : EVENT_DISC
    const size = disc.cells * MARKER_CELL_PX
    const drawn = props.selected ? disc.cells + SHADOW_CELLS : disc.cells
    const icon = PIN_ICONS[props.icon]
    const iconBox = PIN_ICON_BOXES[props.icon]
    const iconShift = props.selected ? SELECTED_HALF_GROWTH : 0

    return (
        <span
            className="relative block shrink-0"
            style={{ width: size, height: size, marginBottom: -iconShift }}
        >
            {props.behind}
            <svg
                aria-hidden={true}
                width={drawn * MARKER_CELL_PX}
                height={drawn * MARKER_CELL_PX}
                viewBox={`0 0 ${String(drawn)} ${String(drawn)}`}
                shapeRendering="crispEdges"
                className={cn("absolute top-0 left-0", {
                    "text-live": props.kind === "live",
                    "text-upcoming": props.kind === "upcoming",
                    "text-ended": props.kind === "ended",
                    "text-permanent": props.kind === "permanent",
                })}
            >
                <path d={disc.shadowPath} className="fill-line" />
                <path d={disc.fillPath} fill="currentColor" />
                <path
                    d={disc.ringPath}
                    className={cn("fill-line", {
                        "[mask-image:repeating-conic-gradient(#000_0_15deg,transparent_15deg_30deg)]":
                            props.kind === "ended",
                    })}
                />
            </svg>
            <svg
                aria-hidden={true}
                width={iconBox.side}
                height={iconBox.side}
                viewBox={`0 0 ${String(icon.cells)} ${String(icon.cells)}`}
                shapeRendering="crispEdges"
                className="fill-line absolute"
                style={{ left: iconBox.left + iconShift, top: iconBox.top + iconShift }}
            >
                <path d={icon.path} />
            </svg>
        </span>
    )
}
