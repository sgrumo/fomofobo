"use client"

import { MARKER_MOTION_MS } from "domain/marker-motion"
import type { MarkerMove, PixelOffset } from "domain/marker-motion"
import { cn } from "frontend-shared/styles"
import type { ReactNode } from "react"
import { useEffectEvent, useLayoutEffect, useRef } from "react"
import { match, P } from "ts-pattern"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface MarkerMotionProps extends RouteClientComponentProps<"root"> {
    move: MarkerMove | undefined
    children: ReactNode
}

/**
 * @description Returns the CSS translation of an offset
 * @param offset Offset in px, none for no move
 */
const translationOf = (offset: PixelOffset | undefined): string =>
    offset === undefined ? "0 0" : `${String(offset.x)}px ${String(offset.y)}px`

/**
 * @description Returns the keyframes of a move: an entering marker slides in from its offset or fades in, a leaving one slides to its offset and fades out
 * @param move Move played
 */
const keyframesOf = (move: MarkerMove): Keyframe[] =>
    match(move)
        .with({ type: "enter", from: P.nonNullable }, enter => [
            { translate: translationOf(enter.from) },
            { translate: "0 0" },
        ])
        .with({ type: "enter" }, () => [{ opacity: 0 }, { opacity: 1 }])
        .with({ type: "leave" }, leave => [
            { opacity: 1, translate: "0 0" },
            { opacity: 0, translate: translationOf(leave.to) },
        ])
        .exhaustive()

export const MarkerMotion = (props: MarkerMotionProps) => {
    const ref = useRef<HTMLSpanElement>(null)
    const readMove = useEffectEvent(() => props.move)

    // A marker plays its move once, when it mounts
    useLayoutEffect(() => {
        const move = readMove()
        const element = ref.current
        if (move === undefined || element === null) {
            return undefined
        }
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
            element.style.opacity = move.type === "leave" ? "0" : ""
            return undefined
        }
        const animation = element.animate(keyframesOf(move), {
            duration: MARKER_MOTION_MS,
            easing: "ease-out",
            fill: "both",
        })
        return () => {
            animation.cancel()
        }
    }, [])

    return (
        <span
            ref={ref}
            className={cn("block", {
                "pointer-events-none": props.move?.type === "leave",
            })}
        >
            {props.children}
        </span>
    )
}
