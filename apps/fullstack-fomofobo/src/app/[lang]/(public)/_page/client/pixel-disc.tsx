"use client"

import type { MapPointKind } from "domain/event-clusters"
import { PIXEL_GLYPH_GRID, PIXEL_GLYPHS } from "domain/pixel-glyphs"
import { pixelIconPath } from "domain/pixel-icons"
import { EVENT_DISC, MARKER_CELL_PX, SELECTED_EVENT_DISC } from "domain/pixel-markers"
import { cn } from "frontend-shared/styles"
import type { CategoryIcon } from "models"
import type { ReactNode } from "react"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

// Shadow cells of a selected disc, right and down
const SHADOW_CELLS = 2

const GLYPH_PX = PIXEL_GLYPH_GRID * MARKER_CELL_PX

interface PixelDiscProps extends RouteClientComponentProps<"root"> {
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

    return (
        <span className="relative block shrink-0" style={{ width: size, height: size }}>
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
                {props.selected ? (
                    <path d={disc.shadowPath} className="fill-line" />
                ) : undefined}
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
                width={GLYPH_PX}
                height={GLYPH_PX}
                viewBox={`0 0 ${String(PIXEL_GLYPH_GRID)} ${String(PIXEL_GLYPH_GRID)}`}
                shapeRendering="crispEdges"
                className="fill-line absolute top-1/2 left-1/2 -translate-1/2"
            >
                <path d={pixelIconPath(PIXEL_GLYPHS[props.icon])} />
            </svg>
        </span>
    )
}
