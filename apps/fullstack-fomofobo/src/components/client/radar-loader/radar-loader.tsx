"use client"

import { RADAR_LOADER, RADAR_LOADER_FADE_MS } from "domain/radar-loader"
import { cn } from "frontend-shared/styles"
import { useEffect, useState } from "react"

interface RadarLoaderProps {
    title: string
    // Side of one cell of the drawing, in px
    cellPx: number
    className?: string
}

// The animated radar of the logo, cream for the map ground, fading in as it appears
export const RadarLoader = (props: RadarLoaderProps) => {
    const [tick, setTick] = useState(0)
    const side = RADAR_LOADER.cells * props.cellPx
    const frame = RADAR_LOADER.tickFrames[tick % RADAR_LOADER.tickFrames.length] ?? 0

    useEffect(() => {
        const startedAt = performance.now()
        const timer = setInterval(() => {
            setTick(Math.floor((performance.now() - startedAt) / RADAR_LOADER.tickMs))
        }, RADAR_LOADER.tickMs)
        return () => {
            clearInterval(timer)
        }
    }, [])

    return (
        <svg
            role="img"
            aria-label={props.title}
            width={side}
            height={side}
            viewBox={`0 0 ${String(RADAR_LOADER.cells)} ${String(RADAR_LOADER.cells)}`}
            shapeRendering="crispEdges"
            className={cn(
                "animate-in fill-surface shrink-0 [--tw-enter-opacity:0] motion-reduce:animate-none",
                props.className,
            )}
            style={{ animationDuration: `${String(RADAR_LOADER_FADE_MS)}ms` }}
        >
            <path d={RADAR_LOADER.framePaths[frame]} />
        </svg>
    )
}
