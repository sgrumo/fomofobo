import { cssInterop } from "nativewind"
import { useState } from "react"
import type { ComponentProps, ReactNode } from "react"
import { Pressable } from "react-native"
import type { StyleProp, ViewStyle } from "react-native"
import Animated, { useReducedMotion } from "react-native-reanimated"
import type { StrictOmit } from "shared/types"

import { pressBounceStyle } from "./press-bounce.styles"
import type { Bounce } from "./press-bounce.styles"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
cssInterop(AnimatedPressable, { className: "style" })

type PressBounceProps = StrictOmit<
    ComponentProps<typeof Pressable>,
    "style" | "children"
> & {
    bounce: Bounce
    styleOf?: (pressed: boolean) => StyleProp<ViewStyle>
    children?: ReactNode | ((pressed: boolean) => ReactNode)
}

const PressBounce = ({
    bounce,
    styleOf,
    children,
    onPressIn,
    onPressOut,
    ...props
}: PressBounceProps) => {
    const [pressed, setPressed] = useState(false)
    const reducedMotion = useReducedMotion()

    return (
        <AnimatedPressable
            {...props}
            style={[styleOf?.(pressed), pressBounceStyle(bounce, pressed, reducedMotion)]}
            onPressIn={event => {
                setPressed(true)
                onPressIn?.(event)
            }}
            onPressOut={event => {
                setPressed(false)
                onPressOut?.(event)
            }}
        >
            {typeof children === "function" ? children(pressed) : children}
        </AnimatedPressable>
    )
}

export { PressBounce }
