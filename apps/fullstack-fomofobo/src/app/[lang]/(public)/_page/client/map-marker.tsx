"use client"

import { Marker } from "maplibre-gl"
import type { Map as MapLibreMap, PositionAnchor } from "maplibre-gl"
import type { GeoPoint } from "models"
import type { ReactNode } from "react"
import { useEffect, useMemo } from "react"
import { createPortal } from "react-dom"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface MapMarkerProps extends RouteClientComponentProps<"root"> {
    map: MapLibreMap
    coordinates: GeoPoint
    anchor: PositionAnchor
    children: ReactNode
}

export const MapMarker = (props: MapMarkerProps) => {
    const element = useMemo(() => document.createElement("div"), [])
    const { latitude, longitude } = props.coordinates

    useEffect(() => {
        const marker = new Marker({ element, anchor: props.anchor })
            .setLngLat([longitude, latitude])
            .addTo(props.map)
        return () => {
            marker.remove()
        }
    }, [element, latitude, longitude, props.anchor, props.map])

    return createPortal(props.children, element)
}
