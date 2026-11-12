import { Image } from "expo-image"
import { hideAsync } from "expo-splash-screen"
import { useEffect, useState } from "react"
import { View } from "react-native"
import Animated, { FadeOut, useReducedMotion } from "react-native-reanimated"

import radar from "../../../assets/splash/radar.gif"

// One sweep of the radar, the length of the GIF, which plays once
const SPLASH_RADAR_MS = 4000

const SPLASH_RADAR_SIZE = 240

export const SplashRadar = () => {
    const reducedMotion = useReducedMotion()
    const [shown, setShown] = useState(true)

    useEffect(() => {
        void hideAsync()
        const timer = setTimeout(() => {
            setShown(false)
        }, SPLASH_RADAR_MS)
        return () => {
            clearTimeout(timer)
        }
    }, [])

    if (!shown || reducedMotion) {
        return undefined
    }

    return (
        <Animated.View
            exiting={FadeOut}
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants"
            className="absolute inset-0 items-center justify-center bg-map-ground"
        >
            <View style={{ width: SPLASH_RADAR_SIZE, height: SPLASH_RADAR_SIZE }}>
                <Image source={radar} style={{ flex: 1 }} />
            </View>
        </Animated.View>
    )
}
