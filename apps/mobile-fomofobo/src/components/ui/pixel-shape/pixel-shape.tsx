import { useId } from "react"
import { View } from "react-native"
import Svg, { ClipPath, Defs, Path } from "react-native-svg"

import {
    dashWedgesPath,
    innerProfile,
    PIXEL_RING_WIDTH,
    steppedPath,
} from "@/lib/pixel/pixel-shapes"
import type { HardShadowSize } from "@/lib/theme/hard-shadow"
import { HARD_SHADOW_OFFSETS, THEME_COLORS } from "@/lib/theme/theme-tokens"
import type { ThemeColor } from "@/lib/theme/theme-tokens"

import { pixelShapeStyles } from "./pixel-shape.styles"

interface PixelShapeProps {
    width: number
    height: number
    profile: readonly number[]
    fill: ThemeColor
    ink: ThemeColor
    shadow?: HardShadowSize
    dashed?: boolean
}

// Draws behind the content of its parent. The shadow falls outside the box, so the parent keeps
// `overflow` visible.
const PixelShape = (props: PixelShapeProps) => {
    const offset = props.shadow === undefined ? 0 : HARD_SHADOW_OFFSETS[props.shadow]
    const ring = 2 * PIXEL_RING_WIDTH
    const id = useId()
    const dashed = props.dashed === true

    return (
        <View className={pixelShapeStyles}>
            <Svg width={props.width + offset} height={props.height + offset}>
                {dashed && (
                    <Defs>
                        <ClipPath id={`${id}-ring`}>
                            <Path d={dashWedgesPath(props.width, props.height)} />
                        </ClipPath>
                        <ClipPath id={`${id}-shadow`}>
                            <Path d={dashWedgesPath(props.width, props.height, offset)} />
                        </ClipPath>
                    </Defs>
                )}
                {offset > 0 && (
                    <Path
                        fill={THEME_COLORS.line}
                        d={steppedPath(props.width, props.height, props.profile, offset)}
                        clipPath={dashed ? `url(#${id}-shadow)` : undefined}
                    />
                )}
                <Path
                    fill={THEME_COLORS[props.ink]}
                    d={steppedPath(props.width, props.height, props.profile)}
                    clipPath={dashed ? `url(#${id}-ring)` : undefined}
                />
                <Path
                    fill={THEME_COLORS[props.fill]}
                    d={steppedPath(
                        props.width - ring,
                        props.height - ring,
                        innerProfile(props.profile),
                        PIXEL_RING_WIDTH,
                    )}
                />
            </Svg>
        </View>
    )
}

export { PixelShape }
