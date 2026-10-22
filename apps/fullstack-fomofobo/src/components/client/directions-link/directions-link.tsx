"use client"

import type { GeoPoint } from "models"
import type { ReactNode } from "react"

import { directionsUrl, mapsProviderOf } from "@/lib/geo/directions-url"

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
