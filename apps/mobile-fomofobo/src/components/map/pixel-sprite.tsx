import { MARKER_CELL_PX } from "domain/pixel-markers"
import type { MarkerSprite } from "domain/pixel-markers"
import { View } from "react-native"
import Animated, { steps, useReducedMotion } from "react-native-reanimated"
import Svg, { Path } from "react-native-svg"

interface PixelSpriteProps {
    sprite: MarkerSprite
    color: string
    // Side of the box the sprite centers on, in points
    box: number
}

export const PixelSprite = (props: PixelSpriteProps) => {
    const reducedMotion = useReducedMotion()
    const size = props.sprite.cells * MARKER_CELL_PX
    const strip = size * props.sprite.frames

    return (
        <View
            pointerEvents="none"
            className="absolute overflow-hidden"
            style={{
                width: size,
                height: size,
                left: (props.box - size) / 2,
                top: (props.box - size) / 2,
            }}
        >
            {props.sprite.stillPath === "" ? undefined : (
                <View className="absolute left-0 top-0">
                    <Svg
                        width={size}
                        height={size}
                        viewBox={`0 0 ${String(props.sprite.cells)} ${String(props.sprite.cells)}`}
                    >
                        <Path d={props.sprite.stillPath} fill={props.color} />
                    </Svg>
                </View>
            )}
            <Animated.View
                style={
                    reducedMotion
                        ? undefined
                        : {
                              animationName: {
                                  from: { transform: [{ translateX: 0 }] },
                                  to: { transform: [{ translateX: -strip }] },
                              },
                              animationDuration: props.sprite.cycleMs,
                              animationIterationCount: "infinite",
                              animationTimingFunction: steps(props.sprite.frames),
                          }
                }
            >
                <Svg
                    width={strip}
                    height={size}
                    viewBox={`0 0 ${String(props.sprite.cells * props.sprite.frames)} ${String(props.sprite.cells)}`}
                >
                    <Path d={props.sprite.path} fill={props.color} />
                </Svg>
            </Animated.View>
        </View>
    )
}
