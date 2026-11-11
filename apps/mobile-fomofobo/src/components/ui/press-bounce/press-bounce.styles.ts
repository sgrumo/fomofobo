import type { ViewStyle } from "react-native"
import { cubicBezier } from "react-native-reanimated"
import type { CSSTransitionProperties } from "react-native-reanimated"

export interface Bounce {
    // Scale of the pressed control, 1 at rest
    scale: number
    // True when the pressed control moves 2 pt right and down, onto its hard shadow
    shift: boolean
}

// The `press-bounce` of the web: 150 ms with an overshoot
const PRESS_BOUNCE_TRANSITION: CSSTransitionProperties = {
    transitionProperty: "transform",
    transitionDuration: 150,
    transitionTimingFunction: cubicBezier(0.34, 1.56, 0.64, 1),
}

/**
 * @description Returns the transform of a control and the transition between its rest and pressed looks
 * @param bounce Pressed scale and shift of the control
 * @param pressed True while the finger is down
 * @param reducedMotion True under Reduce Motion
 */
export const pressBounceStyle = (
    bounce: Bounce,
    pressed: boolean,
    reducedMotion: boolean,
): ViewStyle & CSSTransitionProperties => {
    const shift = pressed && bounce.shift ? 2 : 0
    return {
        ...PRESS_BOUNCE_TRANSITION,
        transform: [
            { translateX: shift },
            { translateY: shift },
            { scale: pressed && !reducedMotion ? bounce.scale : 1 },
        ],
    }
}
