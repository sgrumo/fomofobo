import { RADAR_LOADER } from "domain/radar-loader"
import { useEffect, useState } from "react"
import Animated from "react-native-reanimated"
import Svg, { Path } from "react-native-svg"

import { THEME_COLORS } from "@/lib/theme/theme-tokens"

import { radarLoaderFadeIn } from "./radar-loader.styles"

interface RadarLoaderProps {
    label: string
    // Side of one cell of the drawing, in pt
    cellSize: number
}

// The animated radar of the logo, cream for the map ground, fading in as it appears
const RadarLoader = (props: RadarLoaderProps) => {
    const [tick, setTick] = useState(0)
    const side = RADAR_LOADER.cells * props.cellSize
    const frame = RADAR_LOADER.tickFrames[tick % RADAR_LOADER.tickFrames.length] ?? 0

    useEffect(() => {
        const startedAt = Date.now()
        const timer = setInterval(() => {
            setTick(Math.floor((Date.now() - startedAt) / RADAR_LOADER.tickMs))
        }, RADAR_LOADER.tickMs)
        return () => {
            clearInterval(timer)
        }
    }, [])

    return (
        <Animated.View
            accessibilityRole="progressbar"
            accessibilityLabel={props.label}
            entering={radarLoaderFadeIn}
        >
            <Svg
                width={side}
                height={side}
                viewBox={`0 0 ${String(RADAR_LOADER.cells)} ${String(RADAR_LOADER.cells)}`}
            >
                <Path d={RADAR_LOADER.framePaths[frame]} fill={THEME_COLORS.surface} />
            </Svg>
        </Animated.View>
    )
}

export { RadarLoader }
