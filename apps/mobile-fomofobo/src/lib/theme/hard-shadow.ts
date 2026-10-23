import type { ViewStyle } from "react-native"

import { HARD_SHADOW_OFFSETS, THEME_COLORS } from "./theme-tokens"
import type { ThemeColor } from "./theme-tokens"

export type HardShadowSize = keyof typeof HARD_SHADOW_OFFSETS

/**
 * @description Returns the style of a hard shadow offset right and down, the `shadow-hard-*` of the web
 * @param size Offset step of the shadow
 * @param color Shadow color
 * @remarks Draws a rectangle only, so a stepped shape draws its shadow in its own SVG
 */
export const hardShadow = (
    size: HardShadowSize,
    color: ThemeColor = "line",
): ViewStyle => {
    const offset = `${String(HARD_SHADOW_OFFSETS[size])}px`
    return { boxShadow: `${offset} ${offset} 0px 0px ${THEME_COLORS[color]}` }
}

/**
 * @description Returns the style of a pressed control: moved onto its shadow, the shadow one step smaller
 * @param color Shadow color
 */
export const pressedHardShadow = (color: ThemeColor = "line"): ViewStyle => ({
    ...hardShadow("sm", color),
    transform: [{ translateX: 2 }, { translateY: 2 }],
})
