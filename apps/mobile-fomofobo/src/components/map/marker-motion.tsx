import { MARKER_MOTION_MS } from "domain/marker-motion"
import type { MarkerMove, PixelOffset } from "domain/marker-motion"
import type { ReactNode } from "react"
import Animated, { useReducedMotion } from "react-native-reanimated"
import type {
    CSSAnimationKeyframes,
    CSSAnimationProperties,
} from "react-native-reanimated"
import { match, P } from "ts-pattern"

interface MarkerMotionProps {
    move: MarkerMove | undefined
    // False while the native marker is not on screen yet: an entering marker waits at its start
    shown: boolean
    children: ReactNode
}

/**
 * @description Returns the transform of an offset
 * @param offset Offset in pt, none for no move
 */
const translationOf = (offset: PixelOffset | undefined) => [
    { translateX: offset?.x ?? 0 },
    { translateY: offset?.y ?? 0 },
]

/**
 * @description Returns the style an entering marker starts from: at the offset of the cluster it split from, else hidden
 * @param from Offset of the cluster, none for a fade-in
 */
const enterStartOf = (from: PixelOffset | undefined) =>
    from === undefined ? { opacity: 0 } : { transform: translationOf(from) }

/**
 * @description Returns the keyframes of a move, as the web `MarkerMotion`: an entering marker slides in from its offset or fades in, a leaving one slides to its offset and fades out
 * @param move Move played
 */
const keyframesOf = (move: MarkerMove): CSSAnimationKeyframes =>
    match(move)
        .with({ type: "enter", from: P.nonNullable }, enter => ({
            from: enterStartOf(enter.from),
            to: { transform: translationOf(undefined) },
        }))
        .with({ type: "enter" }, () => ({
            from: enterStartOf(undefined),
            to: { opacity: 1 },
        }))
        .with({ type: "leave" }, leave => ({
            from: { opacity: 1, transform: translationOf(undefined) },
            to: { opacity: 0, transform: translationOf(leave.to) },
        }))
        .exhaustive()

export const MarkerMotion = (props: MarkerMotionProps) => {
    const reducedMotion = useReducedMotion()
    const move = props.move

    const style: CSSAnimationProperties | ReturnType<typeof enterStartOf> | undefined =
        move === undefined
            ? undefined
            : reducedMotion
              ? move.type === "leave"
                  ? { opacity: 0 }
                  : undefined
              : move.type === "enter" && !props.shown
                ? enterStartOf(move.from)
                : {
                      animationName: keyframesOf(move),
                      animationDuration: MARKER_MOTION_MS,
                      animationTimingFunction: "ease-out",
                      animationFillMode: "both",
                  }

    return (
        <Animated.View
            pointerEvents={move?.type === "leave" ? "none" : "box-none"}
            style={style}
        >
            {props.children}
        </Animated.View>
    )
}
