import { LoaderCircle } from "lucide-react-native"
import Animated, { useReducedMotion } from "react-native-reanimated"

import { THEME_COLORS } from "@/lib/theme/theme-tokens"
import type { ThemeColor } from "@/lib/theme/theme-tokens"

import { spinnerSizes, stepSpin } from "./spinner.styles"

interface SpinnerProps {
    label: string
    size?: keyof typeof spinnerSizes
    color?: ThemeColor
}

const Spinner = (props: SpinnerProps) => {
    const reducedMotion = useReducedMotion()

    return (
        <Animated.View
            accessibilityRole="progressbar"
            accessibilityLabel={props.label}
            style={reducedMotion ? undefined : stepSpin}
        >
            <LoaderCircle
                size={spinnerSizes[props.size ?? "md"]}
                color={THEME_COLORS[props.color ?? "fg"]}
            />
        </Animated.View>
    )
}

export { Spinner }
