import { Marker } from "@maplibre/maplibre-react-native"
import type { MarkerProps } from "@maplibre/maplibre-react-native"
import type { MarkerMove } from "domain/marker-motion"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Platform } from "react-native"

import { MarkerMotion } from "./marker-motion"

// Starts the move of a marker whose show event never comes
const SHOW_FALLBACK_MS = 1000

interface MapMarkerProps {
    lngLat: [number, number]
    anchor: MarkerProps["anchor"]
    offset?: MarkerProps["offset"]
    layer: number
    move: MarkerMove | undefined
    onPress: (() => void) | undefined
    children: ReactNode
}

export const MapMarker = (props: MapMarkerProps) => {
    // iOS puts a new marker on screen a few frames after it mounts, and reports it
    const [shown, setShown] = useState(Platform.OS !== "ios")
    useEffect(() => {
        if (shown) {
            return undefined
        }
        const timer = setTimeout(() => {
            setShown(true)
        }, SHOW_FALLBACK_MS)
        return () => {
            clearTimeout(timer)
        }
    }, [shown])

    return (
        <Marker
            lngLat={props.lngLat}
            anchor={props.anchor}
            offset={props.offset}
            style={{ zIndex: props.layer }}
            onPress={props.onPress}
            onShow={() => {
                setShown(true)
            }}
        >
            <MarkerMotion move={props.move} shown={shown}>
                {props.children}
            </MarkerMotion>
        </Marker>
    )
}
