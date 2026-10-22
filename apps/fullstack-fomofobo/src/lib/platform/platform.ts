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

// PLACEHOLDER(TQ-04): every limit below
export const MAX_OCCURRENCES_PER_EVENT = 366
export const MAX_SEARCH_RESULTS = 500
export const MAX_PERMANENT_VENUE_RESULTS = 100
