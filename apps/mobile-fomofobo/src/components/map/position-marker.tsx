import { POSITION_BREATH_MS, POSITION_HALO } from "domain/pixel-shapes"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import Animated, { useReducedMotion } from "react-native-reanimated"
import type { CSSAnimationProperties } from "react-native-reanimated"
import Svg, { Path } from "react-native-svg"

import { THEME_COLORS } from "@/lib/theme/theme-tokens"

const DOT_SIZE = 16

// Shown for the first half of the period, hidden for the second, as the web `halo-breath` keyframes
const haloBreath: CSSAnimationProperties = {
    animationName: {
        "0%": { opacity: 1 },
        "50%": { opacity: 0 },
        "100%": { opacity: 0 },
    },
    animationDuration: POSITION_BREATH_MS,
    animationIterationCount: "infinite",
    animationTimingFunction: "step-end",
}

const haloPlacement = {
    left: (DOT_SIZE - POSITION_HALO.size) / 2,
    top: (DOT_SIZE - POSITION_HALO.size) / 2,
}

export const PositionMarker = () => {
    const { t } = useTranslation("shared")
    const reducedMotion = useReducedMotion()

    return (
        <View
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={t("Map.Position")}
            className="h-4 w-4"
        >
            <View pointerEvents="none" className="absolute" style={haloPlacement}>
                <Svg
                    width={POSITION_HALO.size}
                    height={POSITION_HALO.size}
                    viewBox={POSITION_HALO.viewBox}
                >
                    <Path d={POSITION_HALO.innerPath} fill={THEME_COLORS.position} />
                </Svg>
            </View>
            {!reducedMotion && (
                <Animated.View
                    pointerEvents="none"
                    className="absolute"
                    style={{ ...haloPlacement, ...haloBreath }}
                >
                    <Svg
                        width={POSITION_HALO.size}
                        height={POSITION_HALO.size}
                        viewBox={POSITION_HALO.viewBox}
                    >
                        <Path d={POSITION_HALO.outerPath} fill={THEME_COLORS.position} />
                    </Svg>
                </Animated.View>
            )}
            <View className="h-4 w-4 rounded-full border-2 border-line bg-position" />
        </View>
    )
}
