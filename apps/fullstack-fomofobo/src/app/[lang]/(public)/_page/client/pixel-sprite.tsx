"use client"

import { MARKER_CELL_PX } from "domain/pixel-markers"
import { cn } from "frontend-shared/styles"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface PixelSpriteProps extends RouteClientComponentProps<"root"> {
    sprite: { cells: number; frames: number; path: string }
    frameMs: number
    // Color of the cells, a `text-*` class
    className: string
}

export const PixelSprite = (props: PixelSpriteProps) => {
    const size = props.sprite.cells * MARKER_CELL_PX

    return (
        <span
            aria-hidden={true}
            className={cn(
                "pointer-events-none absolute top-1/2 left-1/2 -translate-1/2 overflow-hidden",
                props.className,
            )}
            style={{ width: size, height: size }}
        >
            <svg
                width={size * props.sprite.frames}
                height={size}
                viewBox={`0 0 ${String(props.sprite.cells * props.sprite.frames)} ${String(props.sprite.cells)}`}
                shapeRendering="crispEdges"
                className="animate-sprite block motion-reduce:animate-none"
                style={{
                    animationDuration: `${String(props.sprite.frames * props.frameMs)}ms`,
                    animationTimingFunction: `steps(${String(props.sprite.frames)})`,
                }}
            >
                <path d={props.sprite.path} fill="currentColor" />
            </svg>
        </span>
    )
}
