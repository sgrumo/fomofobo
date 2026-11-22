import { Image } from "expo-image"
import { hideAsync } from "expo-splash-screen"
import { useEffect, useState } from "react"
import { View } from "react-native"
import Animated, { FadeOut, useReducedMotion } from "react-native-reanimated"

import { endMark } from "@/lib/perf/perf-store"

import radar from "../../../assets/splash/radar.gif"

// One sweep of the radar, the length of the GIF, which plays once
const SPLASH_RADAR_MS = 4000

// The `imageWidth` of the native splash in `app.config.ts`, which draws the first frame
const SPLASH_RADAR_SIZE = 240

export const SplashRadar = () => {
    const reducedMotion = useReducedMotion()
    const [shown, setShown] = useState(true)

    // Under Reduce Motion no radar paints, so nothing waits to hide the native splash
    useEffect(() => {
        if (reducedMotion) {
            void hideAsync()
            endMark("first-view")
        }
    }, [reducedMotion])

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
                {/* The native splash draws the first frame until the GIF paints it, and the sweep runs whole from there */}
                <Image
                    source={radar}
                    style={{ flex: 1 }}
                    onDisplay={() => {
                        void hideAsync()
                        setTimeout(() => {
                            setShown(false)
                            endMark("first-view")
                        }, SPLASH_RADAR_MS)
                    }}
                    onError={() => {
                        void hideAsync()
                        setShown(false)
                        endMark("first-view")
                    }}
                />
            </View>
        </Animated.View>
    )
}
