import {
    PIXEL_ICON_GRID,
    pixelIconBitmaps,
    pixelIconCenteredViewBox,
    pixelIconPath,
} from "domain/pixel-icons"
import type { PixelIconName } from "domain/pixel-icons"
import Svg, { Path } from "react-native-svg"

import { THEME_COLORS } from "@/lib/theme/theme-tokens"
import type { ThemeColor } from "@/lib/theme/theme-tokens"

import { PIXEL_ICON_SIZE } from "./pixel-icon.styles"

interface PixelIconProps {
    name: PixelIconName
    size?: number
    color?: ThemeColor
    // Moves the drawn cells to the middle of the box, for an icon alone in a round frame
    centered?: boolean
}

// Decorative: the control around the icon carries the label
const PixelIcon = (props: PixelIconProps) => (
    <Svg
        width={props.size ?? PIXEL_ICON_SIZE}
        height={props.size ?? PIXEL_ICON_SIZE}
        viewBox={
            props.centered === true
                ? pixelIconCenteredViewBox(pixelIconBitmaps[props.name])
                : `0 0 ${String(PIXEL_ICON_GRID)} ${String(PIXEL_ICON_GRID)}`
        }
        accessibilityElementsHidden={true}
        importantForAccessibility="no-hide-descendants"
    >
        <Path
            fill={THEME_COLORS[props.color ?? "fg"]}
            d={pixelIconPath(pixelIconBitmaps[props.name])}
        />
    </Svg>
)

export { PixelIcon }
export type { PixelIconProps }
