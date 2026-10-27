import type { GeoPoint } from "models"

// PLACEHOLDER(TQ-03)
export const PLATFORM_TIME_ZONE = "Europe/Rome"

// PLACEHOLDER(OP-03)
export const SEARCH_RADIUS_METERS = 5000

// PLACEHOLDER(OP-01)
export const DEFAULT_WINDOW_DAYS = 7

// PLACEHOLDER(OP-02)
export const DEFAULT_CITY: { label: string; center: GeoPoint } = {
    label: "Imola",
    center: { latitude: 44.3533, longitude: 11.7147 },
}

// West, south, east and north edges of Italy, which the maps never leave
export const MAP_BOUNDS: [number, number, number, number] = [6, 35, 19, 47.5]

export const MAP_MIN_ZOOM = 5
