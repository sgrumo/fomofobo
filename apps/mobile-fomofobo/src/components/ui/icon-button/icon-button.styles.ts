import type { PixelCircleSize } from "domain/pixel-shapes"

import type { ThemeColor } from "@/lib/theme/theme-tokens"

export const iconButtonSizes = {
    sm: { circle: 32, icon: 14 },
    md: { circle: 40, icon: 16 },
    lg: { circle: 48, icon: 20 },
} as const satisfies Record<string, { circle: PixelCircleSize; icon: number }>

export const iconButtonTones = {
    surface: { fill: "surface", icon: "fg" },
    live: { fill: "live", icon: "fg" },
    inverse: { fill: "surface-inverse", icon: "fg-inverse" },
} as const satisfies Record<string, { fill: ThemeColor; icon: ThemeColor }>

export const ICON_BUTTON_TARGET = 44

export const iconButtonPressedStyle = {
    transform: [{ translateX: 2 }, { translateY: 2 }],
}

export const iconButtonMirroredStyles = "-scale-x-100"
