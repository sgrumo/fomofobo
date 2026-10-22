import { z } from "@hono/zod-openapi"

import { eventSchema } from "./events"
import { localDateSchema } from "./lib/local-time"
import { paginationQuerySchema } from "./lib/pagination"
import { occurrenceSummarySchema } from "./occurrences"
import { permanentVenueKindSchema, venueProgrammeUrlSchema, venueSchema } from "./venues"

export const publicVenueSchema = venueSchema
    .pick({
        id: true,
        name: true,
        address: true,
        coordinates: true,
        description: true,
        coverPhotoUrl: true,
        links: true,
        kind: true,
        programmeUrl: true,
    })
    .extend({ upcoming: z.array(occurrenceSummarySchema) })
export type PublicVenue = z.infer<typeof publicVenueSchema>

export const permanentVenueSummarySchema = venueSchema
    .pick({ id: true, name: true, address: true, coordinates: true, coverPhotoUrl: true })
    .extend({
        kind: permanentVenueKindSchema,
        programmeUrl: venueProgrammeUrlSchema,
        categoryId: z.uuid(),
    })
export type PermanentVenueSummary = z.infer<typeof permanentVenueSummarySchema>

export const venueHistoryItemSchema = z.object({
    eventId: z.uuid(),
    title: eventSchema.shape.title,
    categoryIds: eventSchema.shape.categoryIds,
    firstDate: localDateSchema,
    lastDate: localDateSchema,
})
export type VenueHistoryItem = z.infer<typeof venueHistoryItemSchema>

export const venueHistoryQuerySchema = paginationQuerySchema
export type VenueHistoryQuery = z.infer<typeof venueHistoryQuerySchema>
