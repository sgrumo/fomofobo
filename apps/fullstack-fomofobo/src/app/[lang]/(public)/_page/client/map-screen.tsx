"use client"

import type { GeoPoint } from "models"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { match } from "ts-pattern"
import { Alert } from "ui-components/alert"
import { IconButton } from "ui-components/icon-button"
import { PixelIconLocate } from "ui-components/pixel-icons"
import { useToast } from "ui-components/toast"

import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { roundCenter } from "@/lib/geo/round-center"
import { useGeolocation } from "@/lib/hooks/use-geolocation"

/**
 * @description Returns the query keys that make the point the search center
 * @param point Point that becomes the center
 */
const centerQuery = (point: GeoPoint) => {
    const { latitude, longitude } = roundCenter(point)
    return { lat: latitude, lng: longitude }
}

export const MapScreen = (props: RouteClientComponentProps<"root">) => {
    const { t } = useTranslation("shared")
    const toast = useToast()
    const { query, setQuery } = useDynamicRoute(routes[props.route])
    const geolocation = useGeolocation()

    const hasUrlCenter = query.lat !== undefined && query.lng !== undefined
    const position =
        geolocation.state.status === "granted" ? geolocation.state.position : undefined

    // The first position becomes the center, unless the URL already names one.
    useEffect(() => {
        if (position !== undefined && !hasUrlCenter) {
            setQuery(centerQuery(position))
        }
    }, [position, hasUrlCenter, setQuery])

    const locate = async () => {
        const result = await geolocation.locate()
        match(result)
            .with({ status: "granted" }, granted => {
                setQuery({ ...centerQuery(granted.position), place: undefined })
            })
            .with({ status: "denied" }, () => {
                toast.add({
                    type: "info",
                    title: t("Map.LocationBlocked.Title"),
                    messages: [t("Map.LocationBlocked.Description")],
                })
            })
            .with({ status: "unavailable" }, () => {
                toast.add({
                    type: "info",
                    title: t("Map.LocationUnavailable.Title"),
                    messages: [t("Map.LocationUnavailable.Description")],
                })
            })
            .with({ status: "unknown" }, () => undefined)
            .exhaustive()
    }

    const locationOff =
        !hasUrlCenter &&
        (geolocation.state.status === "denied" ||
            geolocation.state.status === "unavailable")

    return (
        <section aria-label={t("Map.Label")} className="bg-map-ground absolute inset-0">
            {locationOff ? (
                <Alert
                    type="info"
                    text={t("Map.LocationOff")}
                    className="absolute inset-x-4 top-4"
                />
            ) : undefined}
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-end gap-2">
                <IconButton
                    aria-label={t("Map.Locate")}
                    icon={<PixelIconLocate />}
                    onClick={() => {
                        void locate()
                    }}
                />
            </div>
        </section>
    )
}
