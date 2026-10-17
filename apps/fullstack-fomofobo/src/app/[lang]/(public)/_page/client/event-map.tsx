"use client"

import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl"
import type { CategoryIcon, GeoPoint, OccurrenceRef, OccurrenceSummary } from "models"
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"

import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { localTimeOf } from "@/lib/events/local-format"
import { occurrenceStatus } from "@/lib/events/occurrence-status"
import { buildEventClusters, CLUSTER_MAX_ZOOM } from "@/lib/map/event-clusters"
import type { EventMapFeature } from "@/lib/map/event-clusters"
import { mapStyle } from "@/lib/map/map-style"
import { PLATFORM_TIME_ZONE } from "@/lib/platform/platform"

import { EventCluster } from "./event-cluster"
import { EventPin } from "./event-pin"
import { MapMarker } from "./map-marker"

setWorkerUrl(
    new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString(),
)

const INITIAL_ZOOM = 13
const DOT_DITHER_IMAGE = "dot-dither"

interface Viewport {
    bbox: [number, number, number, number]
    zoom: number
}

/**
 * @description Returns the bounds and the whole zoom level the map shows
 * @param map Map read
 */
const viewportOf = (map: MapLibreMap): Viewport => {
    const bounds = map.getBounds()
    return {
        bbox: [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
        zoom: Math.floor(map.getZoom()),
    }
}

/**
 * @description True when the browser creates a WebGL2 context, which MapLibre needs
 */
const supportsWebGl2 = (): boolean =>
    document.createElement("canvas").getContext("webgl2") !== null

/**
 * @description Loads the dot pattern image that the ground layer of the style paints with
 * @param map Map the image is added to
 */
const addDotDither = async (map: MapLibreMap): Promise<void> => {
    const image = await map.loadImage(
        mapStyle.metadata["fomofobo:patterns"][DOT_DITHER_IMAGE],
    )
    map.addImage(DOT_DITHER_IMAGE, image.data)
}

/**
 * @description Returns the point of a map feature
 * @param feature Cluster or single result
 */
const featurePoint = (feature: EventMapFeature): GeoPoint | undefined => {
    const [longitude, latitude] = feature.geometry.coordinates
    return longitude === undefined || latitude === undefined
        ? undefined
        : { latitude, longitude }
}

interface EventMapProps extends RouteClientComponentProps<"root"> {
    center: GeoPoint
    position: GeoPoint | undefined
    occurrences: OccurrenceSummary[]
    iconOf: (occurrence: OccurrenceSummary) => CategoryIcon
    now: Date
    onSelect: (ref: OccurrenceRef) => void
}

export const EventMap = (props: EventMapProps) => {
    const { t } = useTranslation("shared")
    const containerRef = useRef<HTMLDivElement>(null)
    const supported = useMemo(() => supportsWebGl2(), [])
    const [map, setMap] = useState<MapLibreMap>()
    const [viewport, setViewport] = useState<Viewport>()
    const readCenter = useEffectEvent(() => props.center)

    useEffect(() => {
        const container = containerRef.current
        if (!supported || container === null) {
            return undefined
        }

        const { latitude, longitude } = readCenter()
        const instance = new MapLibreMap({
            container,
            style: mapStyle,
            center: [longitude, latitude],
            zoom: INITIAL_ZOOM,
            // The expanded control wraps over the bottom controls on a phone, so the map
            // draws its own one-line credit below.
            attributionControl: false,
        })
        const publishViewport = () => {
            setViewport(viewportOf(instance))
        }
        instance.on("load", () => {
            setMap(instance)
            publishViewport()
        })
        instance.on("moveend", publishViewport)
        void addDotDither(instance)

        return () => {
            instance.remove()
        }
    }, [supported])

    const { latitude, longitude } = props.center
    useEffect(() => {
        map?.flyTo({ center: [longitude, latitude] })
    }, [map, latitude, longitude])

    const statuses = props.occurrences.map(occurrence =>
        occurrenceStatus(
            {
                startsAt: new Date(occurrence.startsAt),
                endsAt: new Date(occurrence.endsAt),
            },
            props.now,
        ),
    )
    const clusters = buildEventClusters(
        props.occurrences.map((occurrence, index) => ({
            coordinates: occurrence.venue.coordinates,
            live: statuses[index] === "live",
        })),
    )
    const features =
        viewport === undefined ? [] : clusters.getClusters(viewport.bbox, viewport.zoom)

    if (!supported) {
        return <Alert type="error" text={t("Map.Unsupported")} className="m-4" />
    }

    return (
        <>
            {/* MapLibre sets `position: relative` on its container, so a wrapper places it. */}
            <div className="absolute inset-0">
                <div ref={containerRef} className="size-full" />
            </div>
            <p className="tp-body-sm text-fg-inverse absolute right-4 bottom-1.5 left-4 truncate text-right [&>a]:underline">
                <a href="https://openfreemap.org" target="_blank" rel="noreferrer">
                    OpenFreeMap
                </a>{" "}
                <a href="https://www.openmaptiles.org/" target="_blank" rel="noreferrer">
                    © OpenMapTiles
                </a>{" "}
                <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noreferrer"
                >
                    © OpenStreetMap
                </a>
            </p>
            {map === undefined
                ? undefined
                : features.map(feature => {
                      const point = featurePoint(feature)
                      if (point === undefined) {
                          return undefined
                      }

                      if ("cluster" in feature.properties) {
                          const clusterId = feature.properties.cluster_id
                          return (
                              <MapMarker
                                  route={props.route}
                                  key={`cluster-${String(clusterId)}`}
                                  map={map}
                                  coordinates={point}
                                  anchor="center"
                              >
                                  <EventCluster
                                      route={props.route}
                                      count={feature.properties.point_count}
                                      liveCount={feature.properties.liveCount}
                                      onExpand={() => {
                                          const zoom =
                                              clusters.getClusterExpansionZoom(clusterId)
                                          // Past the last cluster zoom the points share one spot, so no zoom splits them.
                                          const leaf =
                                              zoom > CLUSTER_MAX_ZOOM
                                                  ? clusters.getLeaves(clusterId, 1).at(0)
                                                  : undefined
                                          const first =
                                              leaf === undefined
                                                  ? undefined
                                                  : props.occurrences.at(
                                                        leaf.properties.index,
                                                    )
                                          if (first !== undefined) {
                                              props.onSelect({
                                                  eventId: first.eventId,
                                                  date: first.date,
                                              })
                                              return
                                          }
                                          map.easeTo({
                                              center: [point.longitude, point.latitude],
                                              zoom,
                                          })
                                      }}
                                  />
                              </MapMarker>
                          )
                      }

                      const occurrence = props.occurrences.at(feature.properties.index)
                      const status = statuses.at(feature.properties.index)
                      if (occurrence === undefined || status === undefined) {
                          return undefined
                      }

                      return (
                          <MapMarker
                              route={props.route}
                              key={`${occurrence.eventId}:${occurrence.date}`}
                              map={map}
                              coordinates={point}
                              anchor="bottom"
                          >
                              <EventPin
                                  route={props.route}
                                  title={occurrence.title}
                                  status={status}
                                  startTime={localTimeOf(
                                      new Date(occurrence.startsAt),
                                      PLATFORM_TIME_ZONE,
                                  )}
                                  icon={props.iconOf(occurrence)}
                                  onSelect={() => {
                                      props.onSelect({
                                          eventId: occurrence.eventId,
                                          date: occurrence.date,
                                      })
                                  }}
                              />
                          </MapMarker>
                      )
                  })}
            {map === undefined || props.position === undefined ? undefined : (
                <MapMarker
                    route={props.route}
                    map={map}
                    coordinates={props.position}
                    anchor="center"
                >
                    <span
                        role="img"
                        aria-label={t("Map.Position")}
                        className="bg-position border-line shadow-hard-sm block size-4 rounded-full border-2"
                    />
                </MapMarker>
            )}
        </>
    )
}
