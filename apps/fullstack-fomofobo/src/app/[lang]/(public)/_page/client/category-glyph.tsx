"use client"

import { PIXEL_GLYPH_GRID, PIXEL_GLYPHS } from "domain/pixel-glyphs"
import { pixelIconPath } from "domain/pixel-icons"
import type { CategoryIcon } from "models"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface CategoryGlyphProps extends RouteClientComponentProps<"root"> {
    icon: CategoryIcon
    // Side of one glyph cell in px
    cellPx: number
    className?: string
}

export const CategoryGlyph = (props: CategoryGlyphProps) => (
    <svg
        aria-hidden={true}
        width={PIXEL_GLYPH_GRID * props.cellPx}
        height={PIXEL_GLYPH_GRID * props.cellPx}
        viewBox={`0 0 ${String(PIXEL_GLYPH_GRID)} ${String(PIXEL_GLYPH_GRID)}`}
        shapeRendering="crispEdges"
        className={props.className}
    >
        <path d={pixelIconPath(PIXEL_GLYPHS[props.icon])} />
    </svg>
)
