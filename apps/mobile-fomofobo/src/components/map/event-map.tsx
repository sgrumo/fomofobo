import { Camera, Map, Marker } from "@maplibre/maplibre-react-native"
import type { CameraRef } from "@maplibre/maplibre-react-native"
import { markerLayer } from "domain/event-clusters"
import { mapStyle } from "domain/map-style"
import type { GeoPoint } from "models"
import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { View } from "react-native"

import { hardShadow } from "@/lib/theme/hard-shadow"

import { MapAttribution } from "./map-attribution"

const INITIAL_ZOOM = 13

interface EventMapProps {
    center: GeoPoint
    position: GeoPoint | undefined
}

export const EventMap = (props: EventMapProps) => {
    const { t } = useTranslation("shared")
    const cameraRef = useRef<CameraRef>(null)
    const { latitude, longitude } = props.center

    useEffect(() => {
        cameraRef.current?.flyTo({ center: [longitude, latitude] })
    }, [latitude, longitude])

    return (
        <View accessibilityLabel={t("Map.Label")} className="flex-1 bg-map-ground">
            {/* `dot-dither` ground pattern draws on web only: MapLibre RN 11.5 on iOS never
                passes an `Images` entry, bundled or embedded, to the style */}
            <Map
                mapStyle={mapStyle}
                attribution={false}
                logo={false}
                compass={false}
                touchRotate={false}
                touchPitch={false}
            >
                <Camera
                    ref={cameraRef}
                    initialViewState={{
                        center: [longitude, latitude],
                        zoom: INITIAL_ZOOM,
                    }}
                />
                {props.position !== undefined && (
                    <Marker
                        lngLat={[props.position.longitude, props.position.latitude]}
                        anchor="center"
                        style={{ zIndex: markerLayer("live") + 1 }}
                    >
                        <View
                            accessible={true}
                            accessibilityRole="image"
                            accessibilityLabel={t("Map.Position")}
                            className="h-4 w-4 rounded-full border-2 border-line bg-position"
                            style={hardShadow("sm")}
                        />
                    </Marker>
                )}
            </Map>
            <MapAttribution />
        </View>
    )
}
