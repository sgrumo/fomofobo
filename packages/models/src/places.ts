import { z } from "@hono/zod-openapi"

import { geoPointSchema } from "./lib/geo"
import { occurrenceSummarySchema } from "./occurrences"
import { venueSchema } from "./venues"

export const placeSuggestionSchema = z.object({
    label: z.string(),
    coordinates: geoPointSchema,
})
export type PlaceSuggestion = z.infer<typeof placeSuggestionSchema>

export const placeSearchQuerySchema = z.object({
    q: z.string().trim().min(2).max(100),
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
})
export type PlaceSearchQuery = z.infer<typeof placeSearchQuerySchema>

// PLACEHOLDER(OP-05)
export const searchSuggestionsSchema = z.object({
    places: z.array(placeSuggestionSchema),
    events: z.array(
        occurrenceSummarySchema.pick({ eventId: true, date: true, title: true }),
    ),
    venues: z.array(
        z.object({
            venueId: venueSchema.shape.id,
            name: venueSchema.shape.name,
            address: venueSchema.shape.address,
        }),
    ),
})
export type SearchSuggestions = z.infer<typeof searchSuggestionsSchema>
