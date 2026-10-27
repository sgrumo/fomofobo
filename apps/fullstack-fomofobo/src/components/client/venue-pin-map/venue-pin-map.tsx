"use client"

import { mapStyle } from "domain/map-style"
import { DEFAULT_CITY } from "domain/platform"
import { Map as MapLibreMap, Marker, setWorkerUrl } from "maplibre-gl"
import type { GeoPoint } from "models"
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"

import { FIXED_MAP_OPTIONS, fixMapGestures } from "@/lib/map/fixed-map"

setWorkerUrl(
    new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString(),
)

const PIN_ZOOM = 16

interface VenuePinMapProps {
    value: GeoPoint | undefined
    onValueChange: (value: GeoPoint) => void
    disabled?: boolean
}

/**
 * @description True when the browser creates a WebGL2 context, which MapLibre needs
 */
const supportsWebGl2 = (): boolean =>
    document.createElement("canvas").getContext("webgl2") !== null

export const VenuePinMap = (props: VenuePinMapProps) => {
    const { t } = useTranslation("shared")
    const containerRef = useRef<HTMLDivElement>(null)
    const supported = useMemo(() => supportsWebGl2(), [])
    const [map, setMap] = useState<MapLibreMap>()
    const marker = useMemo(() => new Marker({ draggable: true }), [])
    const readValue = useEffectEvent(() => props.value)
    const publish = useEffectEvent((point: GeoPoint) => {
        if (props.disabled !== true) {
            props.onValueChange(point)
        }
    })

    useEffect(() => {
        const container = containerRef.current
        if (!supported || container === null) {
            return undefined
        }

        const { latitude, longitude } = readValue() ?? DEFAULT_CITY.center
        const instance = new MapLibreMap({
            container,
            style: mapStyle,
            center: [longitude, latitude],
            zoom: PIN_ZOOM,
            ...FIXED_MAP_OPTIONS,
        })
        const releaseGestures = fixMapGestures(instance)
        instance.on("load", () => {
            setMap(instance)
        })
        instance.on("click", event => {
            publish({ latitude: event.lngLat.lat, longitude: event.lngLat.lng })
        })
        const publishDrag = () => {
            const point = marker.getLngLat()
            publish({ latitude: point.lat, longitude: point.lng })
        }
        marker.on("dragend", publishDrag)

        return () => {
            marker.off("dragend", publishDrag)
            marker.remove()
            releaseGestures()
            instance.remove()
        }
    }, [supported, marker])

    const latitude = props.value?.latitude
    const longitude = props.value?.longitude
    useEffect(() => {
        if (map === undefined || latitude === undefined || longitude === undefined) {
            return
        }
        marker.setLngLat([longitude, latitude]).addTo(map)
        map.easeTo({ center: [longitude, latitude] })
    }, [map, marker, latitude, longitude])

    if (!supported) {
        return <Alert type="info" text={t("Backoffice.VenueForm.MapUnsupported")} />
    }

    return (
        <div className="border-line relative h-64 w-full border-2">
            <div ref={containerRef} className="absolute inset-0" />
        </div>
    )
}
