import { PIXEL_GLYPH_GRID, PIXEL_GLYPHS } from "domain/pixel-glyphs"
import { pixelIconPath } from "domain/pixel-icons"
import type { CategoryIcon } from "models"
import Svg, { Path } from "react-native-svg"

import { THEME_COLORS } from "@/lib/theme/theme-tokens"
import type { ThemeColor } from "@/lib/theme/theme-tokens"

import { PIXEL_GLYPH_SIZE } from "./pixel-glyph.styles"

interface PixelGlyphProps {
    icon: CategoryIcon
    color?: ThemeColor
}

// Decorative: the control around the glyph carries the label
const PixelGlyph = (props: PixelGlyphProps) => (
    <Svg
        width={PIXEL_GLYPH_SIZE}
        height={PIXEL_GLYPH_SIZE}
        viewBox={`0 0 ${String(PIXEL_GLYPH_GRID)} ${String(PIXEL_GLYPH_GRID)}`}
        accessibilityElementsHidden={true}
        importantForAccessibility="no-hide-descendants"
    >
        <Path
            fill={THEME_COLORS[props.color ?? "fg"]}
            d={pixelIconPath(PIXEL_GLYPHS[props.icon])}
        />
    </Svg>
)

export { PixelGlyph }
