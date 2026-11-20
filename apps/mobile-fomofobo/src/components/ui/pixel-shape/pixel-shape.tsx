import { useId } from "react"
import { View } from "react-native"
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg"

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
    // Below 1 the map shows through the fill, and the outline and the shadow stay out of it
    fillOpacity?: number
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
    const seeThrough = props.fillOpacity !== undefined
    const outerPath = steppedPath(props.width, props.height, props.profile)
    const innerPath = steppedPath(
        props.width - ring,
        props.height - ring,
        innerProfile(props.profile),
        PIXEL_RING_WIDTH,
    )

    return (
        <View className={pixelShapeStyles}>
            <Svg width={props.width + offset} height={props.height + offset}>
                <Defs>
                    {dashed && (
                        <ClipPath id={`${id}-ring`}>
                            <Path d={dashWedgesPath(props.width, props.height)} />
                        </ClipPath>
                    )}
                    {dashed && (
                        <ClipPath id={`${id}-shadow`}>
                            <Path d={dashWedgesPath(props.width, props.height, offset)} />
                        </ClipPath>
                    )}
                    {seeThrough && (
                        <ClipPath id={`${id}-outside`}>
                            <Path
                                clipRule="evenodd"
                                d={`M0 0H${String(props.width + offset)}V${String(props.height + offset)}H0Z ${outerPath}`}
                            />
                        </ClipPath>
                    )}
                </Defs>
                {offset > 0 && (
                    <G clipPath={seeThrough ? `url(#${id}-outside)` : undefined}>
                        <Path
                            fill={THEME_COLORS.line}
                            d={steppedPath(
                                props.width,
                                props.height,
                                props.profile,
                                offset,
                            )}
                            clipPath={dashed ? `url(#${id}-shadow)` : undefined}
                        />
                    </G>
                )}
                <Path
                    fill={THEME_COLORS[props.ink]}
                    fillRule="evenodd"
                    d={`${outerPath} ${innerPath}`}
                    clipPath={dashed ? `url(#${id}-ring)` : undefined}
                />
                <Path
                    fill={THEME_COLORS[props.fill]}
                    fillOpacity={props.fillOpacity}
                    d={innerPath}
                />
            </Svg>
        </View>
    )
}

export { PixelShape }
