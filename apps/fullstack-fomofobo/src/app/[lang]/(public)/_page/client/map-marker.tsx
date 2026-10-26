"use client"

import { Marker } from "maplibre-gl"
import type { Map as MapLibreMap, PositionAnchor } from "maplibre-gl"
import type { GeoPoint } from "models"
import type { ReactNode } from "react"
import { useEffect, useEffectEvent, useMemo, useRef } from "react"
import { createPortal } from "react-dom"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface MapMarkerProps extends RouteClientComponentProps<"root"> {
    map: MapLibreMap
    coordinates: GeoPoint
    anchor: PositionAnchor
    // Stacking order among the markers, higher on top
    layer: number
    // Shift in px from the anchor, right and down
    offset?: [number, number]
    children: ReactNode
}

export const MapMarker = (props: MapMarkerProps) => {
    const element = useMemo(() => document.createElement("div"), [])
    const { latitude, longitude } = props.coordinates
    const [offsetX = 0, offsetY = 0] = props.offset ?? []

    const markerRef = useRef<Marker>(undefined)
    const readLayer = useEffectEvent(() => props.layer)

    useEffect(() => {
        const marker = new Marker({
            element,
            anchor: props.anchor,
            offset: [offsetX, offsetY],
        })
            .setLngLat([longitude, latitude])
            .addTo(props.map)
        marker.getElement().style.zIndex = String(readLayer())
        markerRef.current = marker
        return () => {
            marker.remove()
        }
    }, [element, latitude, longitude, offsetX, offsetY, props.anchor, props.map])

    // A new layer leaves the marker attached, so its focused button keeps the focus
    useEffect(() => {
        const marker = markerRef.current
        if (marker !== undefined) {
            marker.getElement().style.zIndex = String(props.layer)
        }
    }, [props.layer])

    return createPortal(props.children, element)
}
