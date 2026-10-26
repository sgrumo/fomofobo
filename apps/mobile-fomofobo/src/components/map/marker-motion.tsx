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
 * @description Returns the keyframes of a move, as the web `MarkerMotion`: an entering marker slides in from its offset or fades in, a leaving one slides to its offset and fades out
 * @param move Move played
 */
const keyframesOf = (move: MarkerMove): CSSAnimationKeyframes =>
    match(move)
        .with({ type: "enter", from: P.nonNullable }, enter => ({
            from: { transform: translationOf(enter.from) },
            to: { transform: translationOf(undefined) },
        }))
        .with({ type: "enter" }, () => ({ from: { opacity: 0 }, to: { opacity: 1 } }))
        .with({ type: "leave" }, leave => ({
            from: { opacity: 1, transform: translationOf(undefined) },
            to: { opacity: 0, transform: translationOf(leave.to) },
        }))
        .exhaustive()

export const MarkerMotion = (props: MarkerMotionProps) => {
    const reducedMotion = useReducedMotion()
    const move = props.move

    const style: CSSAnimationProperties | { opacity: number } | undefined =
        move === undefined
            ? undefined
            : reducedMotion
              ? move.type === "leave"
                  ? { opacity: 0 }
                  : undefined
              : {
                    animationName: keyframesOf(move),
                    animationDuration: MARKER_MOTION_MS,
                    animationTimingFunction: "ease-out",
                    animationFillMode: "both",
                }

    return (
        <Animated.View
            pointerEvents={move?.type === "leave" ? "none" : "auto"}
            style={style}
        >
            {props.children}
        </Animated.View>
    )
}
