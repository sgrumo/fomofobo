import type { ViewStyle } from "react-native"

import { HARD_SHADOW_OFFSETS, THEME_COLORS } from "./theme-tokens"

export type HardShadowSize = keyof typeof HARD_SHADOW_OFFSETS

/**
 * @description Returns the style of a hard ink shadow offset right and down, the `shadow-hard-*` of the web
 * @param size Offset step of the shadow
 * @remarks Draws a rectangle only, so a stepped shape draws its shadow in its own SVG
 */
export const hardShadow = (size: HardShadowSize): ViewStyle => {
    const offset = `${String(HARD_SHADOW_OFFSETS[size])}px`
    return { boxShadow: `${offset} ${offset} 0px 0px ${THEME_COLORS.line}` }
}
