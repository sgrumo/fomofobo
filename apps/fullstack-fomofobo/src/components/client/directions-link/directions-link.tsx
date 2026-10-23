"use client"

import { directionsUrl } from "domain/directions-url"
import type { GeoPoint } from "models"
import type { ReactNode } from "react"

import { mapsProviderOf } from "@/lib/geo/maps-provider"

interface DirectionsLinkProps {
    coordinates: GeoPoint
    className: string
    children: ReactNode
}

export const DirectionsLink = (props: DirectionsLinkProps) => (
    <a
        href={directionsUrl(props.coordinates, "google")}
        target="_blank"
        rel="noreferrer"
        className={props.className}
        onClick={event => {
            if (
                mapsProviderOf(navigator.userAgent, navigator.maxTouchPoints) === "apple"
            ) {
                event.preventDefault()
                globalThis.location.assign(directionsUrl(props.coordinates, "apple"))
            }
        }}
    >
        {props.children}
    </a>
)
