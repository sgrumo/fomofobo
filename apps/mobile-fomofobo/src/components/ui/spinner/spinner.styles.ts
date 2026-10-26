import { steps } from "react-native-reanimated"
import type { CSSAnimationProperties } from "react-native-reanimated"

export const spinnerSizes = {
    sm: 20,
    md: 32,
    lg: 48,
} as const

export const stepSpin: CSSAnimationProperties = {
    animationName: { to: { transform: [{ rotate: "360deg" }] } },
    animationDuration: "1s",
    animationIterationCount: "infinite",
    animationTimingFunction: steps(8),
}
