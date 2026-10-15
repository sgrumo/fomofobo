import { z } from "@hono/zod-openapi"

import { geoPointSchema } from "./lib/geo"
import { occurrenceSummarySchema } from "./occurrences"

export const placeSuggestionSchema = z.object({
    label: z.string(),
    coordinates: geoPointSchema,
})
export type PlaceSuggestion = z.infer<typeof placeSuggestionSchema>

// PLACEHOLDER(OP-05)
export const searchSuggestionsSchema = z.object({
    places: z.array(placeSuggestionSchema),
    events: z.array(
        occurrenceSummarySchema.pick({ eventId: true, date: true, title: true }),
    ),
})
export type SearchSuggestions = z.infer<typeof searchSuggestionsSchema>
